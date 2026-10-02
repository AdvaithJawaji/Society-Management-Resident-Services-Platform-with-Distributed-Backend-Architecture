# Society-Management-Resident-Services-Platform-with-Distributed-Backend-Architecture

A distributed web-based society-management platform that digitizes residential community operations.

## Overview
This project provides a full-stack solution for a residential society with distributed microservices, an API gateway, and a modern React frontend.

## Architecture
The platform is built using a distributed backend architecture with an API Gateway and multiple Node.js microservices.

### Tech Stack
- Frontend: React.js, Vite, Tailwind CSS, Axios, Recharts
- API Gateway: Python, FastAPI
- Microservices: Node.js, Express.js
- Database: MySQL
- Caching: Redis

## Project Structure
- `frontend/`: React single-page application.
- `api-gateway/`: FastAPI-based entry point for frontend requests.
- `services/`: Independent Node.js microservices.
- `database/`: SQL schema, seed, procedures, triggers, and views.
- `docs/`: Project documentation.
- `postman/`: API testing collections.

## Quick Start
1. Install dependencies for the frontend and service packages.
2. Start the backend services and API gateway.
3. Run the frontend with Vite.
4. Open the app at http://localhost:5173

## Demo Credentials
- Admin: `admin1` / `password123`
- Resident: `resident_a101` / `password123`
