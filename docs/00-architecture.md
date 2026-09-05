# FixMyCity — Phase 0 Architecture & Planning

> AI-Powered Civic Intelligence & Predictive Maintenance Platform
> A monorepo MVP: `frontend/` (React + Vite) · `backend/` (FastAPI + PostgreSQL) · `docs/`

---

## 1. Project Architecture

**High-level design (3-tier, monorepo)**

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                         │
│  React + Vite + Tailwind + React Router + Axios + Leaflet         │
│  - Citizen UI: report, dashboard, history                         │
│  - Admin UI:  command-center dashboard, map, queue, analytics     │
└──────────────────────────────┬───────────────────────────────────┘
                               │  HTTPS / JSON  (Axios)
                               │  Auth: Bearer JWT in Authorization header
┌──────────────────────────────▼───────────────────────────────────┐
│                  API GATEWAY  (FastAPI · Uvicorn)                 │
│  - Routers:  /auth  /incidents  /ai  /admin  /uploads  /verify   │
│  - Middleware: CORS, JWT auth, RBAC, rate limit, error handler    │
│  - Services:  AI client, risk engine, duplicates, notifications   │
│  - Validation: Pydantic v2 schemas (request + response)            │
└────┬─────────────────┬───────────────────┬───────────────────────┘
     │                 │                   │
     │                 │                   │
┌────▼─────┐    ┌──────▼──────┐     ┌──────▼──────────┐
│ Postgres │    │  Object     │     │  External APIs  │
│   (DB)   │    │  Storage    │     │  - Vision AI    │
│          │    │  (local /   │     │  - Email (SMTP/│
│          │    │   S3-like)  │     │    provider)   │
└──────────┘    └─────────────┘     └─────────────────┘
```

**Architectural principles**
- Strict separation: **API layer (routers) → Service layer (business logic) → Data layer (models)**. No business logic in routes.
- **Async-first** FastAPI for I/O-bound calls (AI, email, storage).
- **Stateless** backend: all state lives in PostgreSQL. JWT carries identity.
- **RBAC**: two roles — `CITIZEN`, `ADMIN`. Admins can do everything; citizens are scoped to their own resources.
- **Backward-compatible schemas** via Pydantic v2 + SQLAlchemy 2.0 typed mapped columns.
- **Defensive AI**: real Vision API in production, an isolated `dev_fallback` classifier labeled clearly when no key is configured.
