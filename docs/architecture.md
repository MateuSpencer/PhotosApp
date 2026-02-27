# PhotosApp Architecture

> Last updated: February 2026

## Overview

PhotosApp (originally "Narratives") is a photo storytelling application that lets users organize photos into narratives, map journeys, and tell stories through images. The project runs across three platforms with a shared backend:

| Platform | Technology | Status |
|----------|-----------|--------|
| Web | Next.js 16, React 19, Tailwind CSS | Active — deployed to Vercel |
| Mobile | React Native, Expo 52, React Native Paper | Active — in development |
| Backend | Supabase (PostgreSQL, Auth, Storage) | Active — primary backend |
| Legacy Backend | Django REST Framework + PostgreSQL | Legacy — mobile still depends on it |

## System Architecture (Current)

```
┌─────────────────────┐
│   Next.js Web App   │ ──── Vercel (Production)
│   (app/ directory)  │
└────────┬────────────┘
         │ Direct queries via @supabase/ssr
         ▼
┌─────────────────────┐
│      Supabase       │
│  ┌───────────────┐  │
│  │  PostgreSQL   │  │
│  │  (RLS)        │  │
│  ├───────────────┤  │
│  │  Auth         │  │
│  ├───────────────┤  │
│  │  Storage      │  │
│  └───────────────┘  │
└─────────────────────┘
         ▲
         │ (planned migration)
         │
┌─────────────────────┐     ┌──────────────────┐
│  Expo Mobile App    │ ──► │  Django REST API  │ ◄── Docker (dev only)
│  (React Native)     │     │  (LEGACY)         │
└─────────────────────┘     └──────────────────┘
```

**Key point:** The web app talks directly to Supabase. The mobile app still talks to the legacy Django backend via REST/JWT. The highest-priority migration task is moving mobile to Supabase.

## Directory Structure

```
PhotosApp/
├── web/                    # Next.js web app (deployed on Vercel)
│   ├── app/                # App Router: pages, layouts, auth
│   │   ├── auth/callback/  # Supabase OAuth callback
│   │   ├── dashboard/      # Main dashboard (read-only currently)
│   │   ├── login/          # Email/password login
│   │   └── register/       # Registration
│   ├── lib/supabase/       # Supabase clients (browser, server, middleware)
│   └── middleware.ts       # Auth session refresh middleware
│
├── mobile/                 # Expo / React Native mobile app
│   ├── app/                # Expo Router file-based routing
│   │   ├── (app)/          # Authenticated screens (drawer navigation)
│   │   └── (auth)/         # Login / Register screens
│   ├── src/
│   │   ├── screens/        # Screen components
│   │   ├── components/     # Reusable components (MapView, etc.)
│   │   ├── contexts/       # AuthContext (JWT-based, Django)
│   │   └── constants/      # Theme, colors
│   └── shared/             # LOCAL COPY of shared code (see duplication note)
│
├── shared/                 # Root shared code (partially dead)
│   ├── api/client.ts       # Axios client → Django (UNUSED)
│   ├── supabase/           # Supabase client factory + database types
│   └── types/index.ts      # Django-shaped types (OUTDATED)
│
├── backend/                # Django REST Framework (LEGACY)
│   ├── narratives_project/ # Django settings, URLs
│   ├── media/              # Media upload, EXIF, thumbnails
│   ├── narratives/         # Narrative CRUD
│   ├── locations/          # Location management
│   ├── projects/           # Project grouping
│   └── users/              # Auth, profiles
│
├── supabase/
│   └── migrations/         # SQL schema (source of truth for DB)
│
└── docs/                   # Documentation
```

## Database Schema

Defined in `supabase/migrations/00001_initial_schema.sql`. All tables have Row Level Security (RLS) enabled.

| Table | Description | RLS |
|-------|------------|-----|
| `profiles` | User profiles (auto-created on auth signup) | Owner-only |
| `narratives` | Photo story collections | Owner-only |
| `media_items` | Photos/videos with EXIF metadata | Owner-only |
| `notes` | Text notes attached to media/narratives | Owner-only |
| `locations` | Named locations | Authenticated read, owner write |
| `location_media` | Junction: locations ↔ media items | Via parent RLS |
| `projects` | Groups of narratives | Owner + public read for published |
| `project_narratives` | Junction: projects ↔ narratives | Via parent RLS |

## Authentication

| Platform | Method | Provider |
|----------|--------|----------|
| Web | Supabase Auth (email/password) | `@supabase/ssr` |
| Mobile | Django JWT (SimpleJWT) | Axios + SecureStore |

The web app uses Supabase Auth with server-side session management via middleware. The mobile app uses Django's JWT token pair (access + refresh) stored in Expo SecureStore (native) or localStorage (web).

## Known Architectural Debt

1. **Dual backend** — Django and Supabase serve the same data models. Mobile must be migrated to Supabase.
2. **Triple-duplicated shared code** — `shared/`, `mobile/shared/`, and `web/lib/supabase/` contain overlapping but divergent copies.
3. **Two incompatible type systems** — Django-shaped types (numeric IDs, `file`, `owner`) vs Supabase types (UUIDs, `file_url`, `owner_id`).
4. **No monorepo tooling** — No npm workspaces, no shared package resolution. Each app manages its own dependencies.
