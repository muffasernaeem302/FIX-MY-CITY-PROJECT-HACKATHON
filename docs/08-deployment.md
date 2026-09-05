# Deployment Guide

## Prerequisites
- Docker & docker-compose installed
- PostgreSQL 15+ (or managed instance)
- Domain + TLS certificate (Let's Encrypt works)
- Node 20 LTS for frontend build
- Python 3.11 for backend build

## Environment Variables for Production

Create `.env.production` based on `.env.example`:

```
APP_ENV=production
APP_PORT=8000
APP_CORS_ORIGINS=https://yourdomain.com

DATABASE_URL=postgresql+psycopg2://user:pass@db:5432/fixmycity_prod

AUTH_SECRET=<64-char-random-string>
AUTH_ACCESS_TTL_MIN=60

STORAGE_DRIVER=s3
STORAGE_BUCKET=fixmycity-prod
STORAGE_REGION=us-east-1
STORAGE_S3_ENDPOINT=https://s3.amazonaws.com  # omit for AWS
STORAGE_S3_ACCESS_KEY=
STORAGE_S3_SECRET_KEY=

AI_PROVIDER=openai_vision
AI_API_KEY=

EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxx

RATE_LIMIT_PER_MIN=100
```

## Build & Run

### 1. Build images

```bash
# From project root
docker compose build
```

### 2. Run migrations

```bash
docker compose run --rm backend alembic upgrade head
```

### 3. Create admin user

```bash
docker compose run --rm backend python -m app.scripts.seed_admin admin@fixmycity.local password
```

### 4. Start all services

```bash
docker compose up -d
```

### 5. Verify

```bash
# API docs
curl http://localhost:8000/docs

# Health check
curl http://localhost:8000/health
```

## Folder structure for docker-compose

```
config/
  nginx/
    default.conf        # reverse proxy for HTTPS
docker-compose.yml
Dockerfile              # backend
  frontend/
    Dockerfile          # multi-stage: build + nginx static serve
```

## Nginx reverse-proxy template snippet

```nginx
server {
    listen 80;
    server_name fixmycity.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fixmycity.example.com;

    ssl_certificate /etc/letsencrypt/live/fixmycity.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fixmycity.example.com/privkey.pem;

    location /api/ {
        proxy_pass http://backend:8000;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
}
```

## Zero-downtime deploy (optional)

Use `docker compose up -d --detach` after pushing new images.

## Monitoring / Logging

- Logs -> container stdout (`docker logs fixmycity-backend-1`)
- Health endpoint at `/health`

## Rollback

```bash
docker compose down
docker compose pull  # old image
docker compose up -d
```