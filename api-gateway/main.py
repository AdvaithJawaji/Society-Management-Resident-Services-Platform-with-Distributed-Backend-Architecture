import asyncio
import os
import jwt
import httpx
import time
import mysql.connector
from fastapi import FastAPI, Request, HTTPException, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Society Management API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkey_for_academic_project_123")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "society_management")

SERVICES = {
    "auth": "http://localhost:5001",
    "billing": "http://localhost:5002",
    "visitors": "http://localhost:5003",
    "complaints": "http://localhost:5004",
    "notifications": "http://localhost:5005",
    "facilities": "http://localhost:5006",
    "vehicles": "http://localhost:5006",
    "analytics": "http://localhost:5007",
}

PUBLIC_ROUTES = [
    "/api/auth/login",
    "/api/auth/register",
    "/health"
]

def search_matches(query: str, *values) -> bool:
    return any(query in str(value or "").casefold() for value in values)


async def fetch_service_list(client_temp: httpx.AsyncClient, url: str, headers: dict) -> list:
    try:
        response = await client_temp.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, list) else []
    except (httpx.HTTPError, ValueError):
        return []


@app.get("/api/search")
async def global_search(q: str, request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing token")

    try:
        user_payload = jwt.decode(auth_header.split(" ", 1)[1], JWT_SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")

    query = q.strip().casefold()
    if not query:
        return {}

    headers = {
        "Authorization": auth_header,
        "x-user-id": str(user_payload.get("userId")),
        "x-user-role": user_payload.get("role", "RESIDENT"),
    }
    async with httpx.AsyncClient(timeout=5.0) as client_temp:
        complaints, vehicles, visitors, providers, events, facilities = await asyncio.gather(
            fetch_service_list(client_temp, "http://localhost:5004/api/complaints", headers),
            fetch_service_list(client_temp, "http://localhost:5006/api/vehicles", headers),
            fetch_service_list(client_temp, "http://localhost:5003/api/visitors", headers),
            fetch_service_list(client_temp, "http://localhost:5007/api/analytics/providers", headers),
            fetch_service_list(client_temp, "http://localhost:5007/api/analytics/events", headers),
            fetch_service_list(client_temp, "http://localhost:5006/api/facilities", headers),
        )

    try:
        connection = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        cursor = connection.cursor(dictionary=True)
        resident_query = """
            SELECT r.id, r.name, u.username, r.phone, f.flat_number, f.block
            FROM residents r
            JOIN users u ON u.id = r.user_id
            JOIN flats f ON f.id = r.flat_id
        """
        if user_payload.get("role") != "ADMIN":
            resident_query += " WHERE r.user_id = %s"
            cursor.execute(resident_query, (user_payload.get("userId"),))
        else:
            cursor.execute(resident_query)
        residents = cursor.fetchall()
        cursor.close()
        connection.close()
    except Exception as error:
        print(f"Resident search failed: {error}")
        residents = []

    filters = {
        "complaints": lambda item: search_matches(query, item.get("title"), item.get("description"), item.get("category"), item.get("flat_number"), item.get("resident_name")),
        "vehicles":   lambda item: search_matches(query, item.get("vehicle_number"), item.get("resident_name"), item.get("flat_number"), item.get("type")),
        "visitors":   lambda item: search_matches(query, item.get("name"), item.get("purpose"), item.get("flat_number"), item.get("status"), item.get("phone")),
        "providers":  lambda item: search_matches(query, item.get("name"), item.get("category"), item.get("phone")),
        "events":     lambda item: search_matches(query, item.get("title"), item.get("description"), item.get("location")),
        "facilities": lambda item: search_matches(query, item.get("name"), item.get("description"), item.get("status")),
        "residents":  lambda item: search_matches(query, item.get("name"), item.get("username"), item.get("phone"), item.get("flat_number"), item.get("block")),
    }
    sources = {
        "complaints": complaints,
        "vehicles":   vehicles,
        "visitors":   visitors,
        "providers":  providers,
        "events":     events,
        "facilities": facilities,
        "residents":  residents,
    }

    # Score each result by relevance — exact/start matches score higher
    def relevance(name, item, q):
        score = 0
        field_map = {
            "providers":  [item.get("name",""), item.get("category",""), item.get("phone","")],
            "residents":  [item.get("name",""), item.get("username",""), item.get("flat_number",""), item.get("phone","")],
            "complaints": [item.get("title",""), item.get("category",""), item.get("description",""), item.get("flat_number","")],
            "vehicles":   [item.get("vehicle_number",""), item.get("resident_name",""), item.get("type","")],
            "facilities": [item.get("name",""), item.get("description","")],
            "events":     [item.get("title",""), item.get("description","")],
            "visitors":   [item.get("name",""), item.get("purpose",""), item.get("flat_number","")],
        }
        for field in field_map.get(name, []):
            f = str(field).casefold()
            if q in f:
                score += 3 if f.startswith(q) else 1
        return score

    # Return in priority order: service providers first, visitors last
    SECTION_ORDER = ["providers", "residents", "complaints", "facilities", "vehicles", "events", "visitors"]
    filtered_results = {}
    for name in SECTION_ORDER:
        matched = [item for item in sources.get(name, []) if filters[name](item)]
        matched.sort(key=lambda item: -relevance(name, item, query))
        if matched:
            filtered_results[name] = matched

    return filtered_results

@app.get("/api/residents")
async def get_all_residents(request: Request):
    try:
        connection = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.id, r.name, u.username, r.phone, f.flat_number, f.block
            FROM residents r
            JOIN users u ON u.id = r.user_id
            JOIN flats f ON f.id = r.flat_id
        """)
        residents = cursor.fetchall()
        cursor.close()
        connection.close()
        return residents
    except Exception as error:
        print(f"Error fetching residents: {error}")
        return []





client = httpx.AsyncClient()

CACHE = {}
CACHE_TTL = 5 # seconds (short TTL to prevent stale responses)

@app.get("/api/cache/clear")
async def clear_cache():
    CACHE.clear()
    return {"message": "Cache cleared", "status": "OK"}

def write_audit_log(user_id: int, action: str, details: str, ip_address: str):
    try:
        conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (%s, %s, %s, %s)",
            (user_id, action, details, ip_address)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Audit log failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await client.aclose()

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def gateway(request: Request, path: str, background_tasks: BackgroundTasks):
    if path == "health":
        health_status = {"status": "UP", "gateway": "UP", "services": {}}
        async with httpx.AsyncClient() as client_temp:
            for name, url in SERVICES.items():
                if name in health_status["services"]:
                    continue
                try:
                    res = await client_temp.get(f"{url}/health", timeout=2.0)
                    health_status["services"][name] = "UP" if res.status_code == 200 else "DOWN"
                except:
                    health_status["services"][name] = "DOWN"
                    health_status["status"] = "DEGRADED"
        return health_status
        
    full_path = f"/{path}"
    
    # 1. JWT Validation
    user_payload = None
    if full_path not in PUBLIC_ROUTES and request.method != "OPTIONS":
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Unauthorized: Missing token")
            
        token = auth_header.split(" ")[1]
        try:
            user_payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Unauthorized: Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")

    # Audit Logging for mutating requests
    if request.method in ["POST", "PUT", "PATCH", "DELETE"] and user_payload:
        background_tasks.add_task(
            write_audit_log, 
            user_payload.get("userId"), 
            f"{request.method} {full_path}", 
            "API Gateway proxied request", 
            request.client.host
        )

    # 2. Route resolution
    path_parts = path.split("/")
    if len(path_parts) < 2 or path_parts[0] != "api":
        raise HTTPException(status_code=404, detail="Not Found")
        
    service_name = path_parts[1]
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail="Service not found")

    target_host = SERVICES[service_name]
    target_url = f"{target_host}{full_path}"
    
    if request.url.query:
        target_url += f"?{request.url.query}"
        
    # --- CACHE CHECK ---
    cache_key = None
    if request.method == "GET" and user_payload:
        cache_key = f"{user_payload.get('userId')}_{target_url}"
        cached_entry = CACHE.get(cache_key)
        if cached_entry and time.time() - cached_entry['timestamp'] < CACHE_TTL:
            print(f"[CACHE HIT] Returning cached response for {full_path}")
            return Response(
                content=cached_entry['content'],
                status_code=200,
                headers={"X-Cache": "HIT", "Content-Type": "application/json"}
            )

    # 3. Forward the request
    headers = dict(request.headers)
    headers.pop("host", None) 
    if user_payload:
        headers["x-user-id"] = str(user_payload.get("userId"))
        headers["x-user-role"] = user_payload.get("role")

    body = await request.body()

    try:
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            timeout=10.0
        )
        
        # --- SAVE TO CACHE ---
        if request.method == "GET" and response.status_code == 200 and cache_key:
            print(f"[CACHE MISS] Saving response to cache for {full_path}")
            CACHE[cache_key] = {
                'content': response.content,
                'timestamp': time.time()
            }
            
        response_headers = dict(response.headers)
        response_headers.pop("content-length", None)
        response_headers.pop("content-encoding", None)
        response_headers["X-Cache"] = "MISS"
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
