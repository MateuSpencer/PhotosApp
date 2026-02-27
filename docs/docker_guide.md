# Docker Guide (Legacy Django Backend)

> Last updated: February 2026
>
> **This guide is for the legacy Django backend only.** The web app uses Supabase directly and does not need Docker. The mobile app still requires this Django backend until it is migrated to Supabase.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

```bash
# From project root
docker-compose up -d
```

This starts two services:

| Service | Port | Description |
|---------|------|-------------|
| `db` | 5432 | PostgreSQL 14 |
| `backend` | 8000 | Django REST API |

The entrypoint script automatically runs migrations and creates a superuser (`admin`/`admin`).

## Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Restart after code changes
docker-compose restart backend

# Reset database (destroys all data)
docker-compose down -v
docker-compose up -d

# Run Django management commands
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py createsuperuser

# Stop everything
docker-compose down
```

## Database Credentials

| Setting | Value |
|---------|-------|
| Database | `narratives_db` |
| User | `narratives_user` |
| Password | `narratives_password` |
| Host (from host) | `localhost:5432` |
| Host (from backend container) | `db:5432` |

## Django Admin

Access at http://localhost:8000/admin/ with credentials `admin`/`admin`.

## API Endpoints

Base URL: `http://localhost:8000/api/`

- `POST /api/auth/register/` — Register
- `POST /api/auth/login/` — Login (returns JWT tokens)
- `POST /api/auth/token/refresh/` — Refresh JWT
- `GET /api/narratives/` — List narratives
- `GET /api/media/` — List media items
- `POST /api/media/batch-upload/` — Batch upload media
- `GET /api/locations/` — List locations
- `GET /api/projects/` — List projects

## Known Issues

- Django runs with the development server (`runserver`), not a production WSGI server
- Container runs as root (no `USER` directive in Dockerfile)
- `SECRET_KEY` has a hardcoded fallback — never use this configuration in production
- `CORS_ALLOW_ALL_ORIGINS = True` — acceptable for local dev only
