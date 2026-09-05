## 2. Technology Stack (Locked)

| Layer            | Technology                                                 |
|------------------|------------------------------------------------------------|
| Frontend build   | Vite 5 + React 18 + JavaScript (JSX)                       |
| Styling          | Tailwind CSS 3 + PostCSS                                   |
| Routing          | React Router v6                                            |
| HTTP             | Axios (with interceptors for auth + error normalization)   |
| Maps             | Leaflet + react-leaflet (OpenStreetMap tiles)              |
| Charts (admin)   | Recharts                                                   |
| Forms            | React Hook Form + zod                                      |
| State            | React Context for auth + lightweight component state       |
| Toasts           | react-hot-toast                                            |
| Backend          | Python 3.11 + FastAPI 0.115+ + Uvicorn                     |
| Validation       | Pydantic v2                                                |
| ORM              | SQLAlchemy 2.0 (typed Mapped[])                            |
| Migrations       | Alembic                                                    |
| DB               | PostgreSQL 15+                                             |
| Auth             | JWT (PyJWT) + bcrypt (passlib)                             |
| File storage     | Local filesystem in dev; S3-compatible adapter interface   |
| Vision AI        | Pluggable provider (e.g., OpenAI Vision) with dev fallback |
| Email            | Pluggable SMTP / provider interface (dev: console logger)  |
| Testing          | pytest (backend) · Vitest + Testing Library (frontend)     |
| Lint/Format      | ESLint + Prettier (FE) · Ruff + Black (BE)                 |
| Containerization | Docker + docker-compose (optional, for deployment phase)    |

**Deliberate exclusions (keep simple per spec):** no Next.js, no GraphQL, no Redis (rate-limit is in-memory for MVP), no Celery (emails are best-effort async tasks via FastAPI BackgroundTasks).

---

## 3. Required Software (Local Machine)

| Tool                | Min version | Purpose                              |
|---------------------|-------------|--------------------------------------|
| Node.js             | 20.x LTS    | Frontend build + dev server          |
| npm                 | 10.x        | Package manager                      |
| Python              | 3.11        | Backend runtime                      |
| PostgreSQL          | 15          | Primary database                     |
| Git                 | 2.40+       | Version control                      |
| VS Code             | latest      | IDE (recommended)                    |
| Docker (optional)   | 24+         | Containerized dev/deploy             |

> A `docker-compose.yml` will be provided in Phase 20 to run Postgres without a local install.

---

## 4. Required VS Code Extensions

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
- **Python** (`ms-python.python`)
- **Pylance** (`ms-python.vscode-pylance`)
- **Ruff** (`charliermarsh.ruff`)
- **SQLTools** (`mtxr.sqltools`) + **SQLTools PostgreSQL/Redshift driver** (`mtxr.sqltools-driver-pg`)
- **DotENV** (`mikestead.dotenv`)
- **Path Intellisense** (`christian-kohler.path-intellisense`)
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
- **Thunder Client** (`rangav.vscode-thunder-client`) — for hitting FastAPI during dev
- **GitLens** (`eamodio.gitlens`)

---

## 5. Required External Services

| Service                  | Purpose                              | Required?                     |
|--------------------------|--------------------------------------|-------------------------------|
| PostgreSQL               | Primary database                     | Yes (local or managed)        |
| Vision AI provider       | Image classification + verification  | Optional in dev (fallback OK) |
| Email provider (SMTP/API)| Transactional email                  | Optional in dev (console OK)  |
| Object storage (S3/MinIO)| Image persistence                    | Optional in dev (local FS OK) |

> All external services are **pluggable via adapters** with a clearly labeled dev fallback. No hard dependency on any single vendor.
