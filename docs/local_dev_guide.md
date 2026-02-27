# Local Development Guide

> Last updated: February 2026

## Architecture Overview

PhotosApp has two frontends and two backends (one legacy):

| Component | How to Run | Port |
|-----------|-----------|------|
| **Web app** (Next.js) | `cd web && npm run dev` | 3000 |
| **Mobile app** (Expo) | `cd mobile && npx expo start` | 8081 |
| **Supabase** (cloud) | Always running | N/A |
| **Django backend** (legacy) | `docker-compose up -d` | 8000 |

The **web app** only needs Supabase — no local backend required.
The **mobile app** currently requires the Django backend via Docker.

## Running the Web App

```bash
cd web
npm install
npm run dev
```

Requires `web/.env.local` with Supabase credentials. See [environment_setup.md](environment_setup.md).

## Running the Mobile App

```bash
# Start legacy backend (required for mobile, for now)
docker-compose up -d

# In another terminal
cd mobile
npm install
npx expo start
```

- Press `a` for Android, `i` for iOS, or scan QR with Expo Go
- The mobile app connects to `http://localhost:8000/api` by default
- For physical devices, update the `baseURL` in `mobile/shared/api/client.ts` to your machine's LAN IP

## Common Tasks

### Reset the Django database
```bash
docker-compose down -v
docker-compose up -d
```

### View Django logs
```bash
docker-compose logs -f backend
```

### Run Django migrations manually
```bash
docker-compose exec backend python manage.py migrate
```

### Update Supabase types
```bash
npx supabase gen types typescript --project-id YOUR_REF > shared/supabase/database.types.ts
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Web app can't connect to Supabase | Check `web/.env.local` credentials |
| Mobile app shows network error | Ensure Docker is running: `docker-compose ps` |
| Mobile app on physical device can't reach backend | Use LAN IP instead of `localhost` in API client |
| Port 8000 already in use | Stop conflicting process or change port in `docker-compose.yml` |
