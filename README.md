# FixMyCity

AI-Powered Civic Intelligence & Predictive Maintenance Platform

A monorepo hackathon MVP for citizens to report infrastructure problems with AI analysis, severity scoring, duplicate detection, civic risk assessment, and department routing.

## Quick Start

### Prerequisites
- Node.js 20 LTS
- Python 3.11+
- PostgreSQL 15+ (or Docker)

### 1. Start PostgreSQL (Docker recommended)
```bash
docker run --name fixmycity-pg -e POSTGRES_USER=fixmycity -e POSTGRES_PASSWORD=fixmycity -e POSTGRES_DB=fixmycity -p 5432:5432 -d postgres:15
```

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env  # macOS/Linux
# Edit .env with your DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env  # macOS/Linux
npm run dev
```

### 4. Seed Admin User (after backend is running)
```bash
cd backend
python -m app.scripts.seed_admin admin@fixmycity.local AdminPass123!
```

Visit:
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

## Project Structure

```
FIXMYCITY/
├── docs/           # Architecture, API, DB schema, deployment, testing
├── backend/        # FastAPI + SQLAlchemy + PostgreSQL
└── frontend/       # React + Vite + Tailwind + Leaflet
```

## Documentation

| Doc | Contents |
|-----|----------|
| docs/00-architecture.md | High-level architecture |
| docs/01-tech-stack.md | Technology stack + extensions |
| docs/02-database.md | Database schema |
| docs/04-api.md | REST API reference |
| docs/05-env.md | Environment variables |
| docs/06-risk-engine.md | Risk scoring, duplicates, routing, AI |
| docs/07-roadmap.md | 22-phase development roadmap |
| docs/08-deployment.md | Production deployment guide |
| docs/09-manual-testing.md | QA checklist |
| docs/10-risks.md | Risks, mitigations, security checklist |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Axios, Leaflet |
| Backend | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| Database | PostgreSQL 15 |
| Auth | JWT (PyJWT) + bcrypt |
| AI | OpenAI Vision API (or dev fallback) |
| Storage | Local filesystem (S3-compatible adapter) |

## MVP Features

- Citizen report submission with photo, geolocation, AI classification
- 4 issue categories: Pothole/Road Damage, Broken Streetlight, Garbage, Water Leakage
- Severity scoring: LOW / MEDIUM / HIGH / CRITICAL
- Civic risk score (0-100) with transparent factor breakdown
- Duplicate detection (geo + text + time + image)
- Department routing (default + admin override)
- Admin command-center dashboard with live map
- Repair evidence upload + AI before/after verification
- Status lifecycle with full audit trail
- In-app notifications

## License

MIT
