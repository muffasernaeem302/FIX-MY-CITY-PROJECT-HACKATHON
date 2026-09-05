# Environment Variable Plan

> No secret ever lives in frontend code. Frontend exposes only public config prefixed `VITE_`.

## Backend (backend/.env)
```
APP_ENV=development
APP_PORT=8000
APP_CORS_ORIGINS=http://localhost:5173

DATABASE_URL=postgresql+psycopg2://fixmycity:fixmycity@localhost:5432/fixmycity

AUTH_SECRET=change-me-32-bytes-min
AUTH_ACCESS_TTL_MIN=60

# Storage
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=./var/uploads
STORAGE_PUBLIC_BASE=http://localhost:8000/static

# AI
AI_PROVIDER=dev_fallback           # or `openai_vision`
AI_API_KEY=
AI_MODEL=gpt-4o-mini

# Email
EMAIL_PROVIDER=console             # or `smtp`
EMAIL_FROM="FixMyCity <noreply@fixmycity.local>"
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_TLS=true

# Rate limiting
RATE_LIMIT_PER_MIN=60
```

## Frontend (frontend/.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## .gitignore essentials
```
.env
.env.*
!.env.example
backend/var/
frontend/node_modules/
frontend/dist/
__pycache__/
*.pyc
.venv/
venv/
.DS_Store
```