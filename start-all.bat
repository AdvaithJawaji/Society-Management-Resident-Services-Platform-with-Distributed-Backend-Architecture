@echo off
echo ===============================================
echo   SOCIETY360 - Starting All Services
echo ===============================================

echo [1/8] Starting Auth Service (Port 5001)...
start "Auth Service" cmd /k "cd /d services\auth-service && npm run dev"
timeout /t 1 /nobreak >nul

echo [2/8] Starting Billing Service (Port 5002)...
start "Billing Service" cmd /k "cd /d services\billing-service && npm run dev"
timeout /t 1 /nobreak >nul

echo [3/8] Starting Visitor Service (Port 5003)...
start "Visitor Service" cmd /k "cd /d services\visitor-service && npm run dev"
timeout /t 1 /nobreak >nul

echo [4/8] Starting Complaint Service (Port 5004)...
start "Complaint Service" cmd /k "cd /d services\complaint-service && npm run dev"
timeout /t 1 /nobreak >nul

echo [5/8] Starting Notification Service (Port 5005)...
start "Notification Service" cmd /k "cd /d services\notification-service && npm run dev"
timeout /t 1 /nobreak >nul

echo [6/8] Starting Facility Service (Port 5006)...
start "Facility Service" cmd /k "cd /d services\facility-service && npm run dev"
timeout /t 1 /nobreak >nul

echo [7/8] Starting Analytics Service (Port 5007)...
start "Analytics Service" cmd /k "cd /d services\analytics-service && npm run dev"
timeout /t 2 /nobreak >nul

echo [8/8] Starting API Gateway (Port 8000)...
start "API Gateway" cmd /k "cd /d api-gateway && venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"
timeout /t 3 /nobreak >nul

echo.
echo [9/9] Starting Frontend (Port 5173)...
start "Frontend" cmd /k "cd /d frontend && npm run dev"

echo.
echo ===============================================
echo   All services started!
echo   Open: http://localhost:5173
echo   Admin:    admin1 / password123
echo   Resident: resident_a101 / password123
echo ===============================================
pause
