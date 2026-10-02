# Society Management & Resident Services Platform

A distributed, full-stack society management system designed to digitalize residential operations such as authentication, billing, visitor management, facility booking, complaints, notifications, vehicle tracking, and analytics. The project demonstrates a microservices-based backend architecture with an API gateway and a responsive React frontend.

## Project Highlights

- Secure resident and admin authentication workflow
- Automated billing and payment tracking
- Visitor registration and approval management
- Complaint submission and monitoring
- Facility booking and scheduling
- Notification center with read/unread updates
- Vehicle management and parking records
- Real-time analytics and governance dashboards
- Modular microservice design for scalability and maintainability
- Responsive frontend interface for community users and administrators

## Why this project matters

This system simulates a modern residential community ecosystem where residents and admins can manage day-to-day operations digitally. It shows how distributed services can be organized around business functions while keeping a unified user experience through a central API gateway.

The project is ideal for learning:

- Microservice architecture patterns
- API Gateway design and request routing
- JWT-based authentication
- Express.js backend service modularization
- FastAPI integration for gateway orchestration
- MySQL database design and relational modeling
- Frontend dashboard design with React and Vite
- Service-to-service communication in distributed systems

## Architecture Overview

The system uses a layered architecture:

- Frontend client built with React and Vite
- API Gateway built with FastAPI
- Multiple Node.js microservices handling isolated business domains
- MySQL database used for persistent data storage
- Redis-style caching patterns for performance optimization and gateway-level improvements

### Service Responsibilities

- Auth Service: login, registration, user identity, JWT generation
- Billing Service: dues, invoices, payment activity
- Visitor Service: visitor logs and pass management
- Complaint Service: resident issues and admin follow-up
- Facility Service: bookings, availability, scheduling
- Notification Service: alerts and status updates
- Analytics Service: insights, dashboards, event metrics

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide icons
- PWA support

### Backend
- Node.js
- Express.js
- FastAPI
- Python HTTP client for gateway routing
- JWT authentication
- MySQL connector

### Database & Tools
- MySQL
- SQL scripts for schema, procedures, seeds, and triggers
- REST API design and service routing

## Folder Structure

```text
society-management-platform/
├── README.md
├── start-all.bat
├── test_db.js
├── api-gateway/
│   ├── main.py
│   ├── requirements.txt
│   ├── check_users.py
│   ├── check_flats.py
│   ├── fix_notifications_enum.py
│   ├── mega_seed.py
│   ├── phase24_data_seed.py
│   ├── phase24_seed.py
│   ├── redistribute_residents.py
│   ├── run_sql.py
│   ├── run_ultimate_sql.py
│   ├── seed_families.py
│   └── seed_residents.py
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── procedures.sql
│   ├── triggers.sql
│   ├── views.sql
│   ├── indexes.sql
│   ├── advanced_features_update.sql
│   └── ultimate_features.sql
├── docs/
│   └── database/
│       └── ER_Diagram.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icons.svg
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── BillingList.jsx
│   │   │   ├── CommunityHub.jsx
│   │   │   ├── ComplaintList.jsx
│   │   │   ├── FacilityBooking.jsx
│   │   │   ├── FinancialDashboard.jsx
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── SecurityDashboard.jsx
│   │   │   ├── SocietyMap.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── SystemHealth.jsx
│   │   │   ├── VehicleManagement.jsx
│   │   │   ├── VisitorList.jsx
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ToastContext.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       └── Login.jsx
│   └── dev-dist/
├── services/
│   ├── auth-service/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── billing-service/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── config/
│   │   ├── controllers/
│   │   └── routes/
│   ├── complaint-service/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── config/
│   │   ├── controllers/
│   │   └── routes/
│   ├── facility-service/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── seed_advanced.js
│   ├── notification-service/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── config/
│   │   ├── controllers/
│   │   └── routes/
│   ├── analytics-service/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── config/
│   │   ├── controllers/
│   │   └── routes/
│   └── visitor-service/
│       ├── index.js
│       ├── package.json
│       ├── config/
│       ├── controllers/
│       └── routes/
└── postman/
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AdvaithJawaji/Society-Management-Resident-Services-Platform-with-Distributed-Backend-Architecture.git
cd society-management-platform
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend service dependencies

```bash
cd ../services/auth-service
npm install

cd ../billing-service
npm install

cd ../visitor-service
npm install

cd ../complaint-service
npm install

cd ../notification-service
npm install

cd ../facility-service
npm install

cd ../analytics-service
npm install
```

### 4. Set up the Python gateway

```bash
cd ../../api-gateway
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Start all services

On Windows:

```bash
start-all.bat
```

Or run each service manually:

```bash
cd services/auth-service
npm run dev

cd ../billing-service
npm run dev

cd ../visitor-service
npm run dev

cd ../complaint-service
npm run dev

cd ../notification-service
npm run dev

cd ../facility-service
npm run dev

cd ../analytics-service
npm run dev

cd ../../api-gateway
venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

cd ../frontend
npm run dev
```

### 6. Open the app

```
http://localhost:5173
```

## Demo Credentials

- Admin: `admin1` / `password123`
- Resident: `resident_a101` / `password123`

## Main Functional Modules

- Resident authentication and role management
- Complaint handling workflows
- Facility booking and scheduling
- Notification management
- Community communication and service data visibility
- Billing and financial analytics
- Visitor and vehicle tracking
- Centralized dashboard reporting

## Learning Outcomes

By exploring this project, you can gain practical understanding of:

- Distributed service orchestration
- API gateway responsibilities
- Role-based access control
- Service-specific business logic separation
- Full-stack integration between frontend and backend
- Database-driven application architecture
- Dashboard and analytics application design
- Scalable architecture patterns used in real-world systems

## Future Improvements

- Add Docker and Kubernetes deployment support
- Integrate real-time Socket.IO event streams across services
- Add automated testing with Jest and Pytest
- Improve API documentation with Swagger/OpenAPI deep dives
- Add deployment pipelines with CI/CD
- Expand analytics and forecasting capabilities
- Improve security with stricter RBAC policies and request validation

## License

This project is intended for academic, learning, and portfolio demonstration purposes.

## Acknowledgements

This project was built as a distributed systems and society management solution that combines frontend, backend, and data modeling practices into one cohesive platform.

