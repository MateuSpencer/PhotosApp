# Development Environment Setup

> Last updated: February 2026

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com) project (free tier works)
- (Optional) Python 3.11+ — only if running the legacy Django backend for mobile development
- (Optional) Docker — only for the legacy Django backend

## Web App Setup (Next.js + Supabase)

### 1. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the migration file: `supabase/migrations/00001_initial_schema.sql`
3. Note your **Project URL** and **Anon Key** from **Settings → API**

### 2. Configure environment

```bash
cd web
cp .env.local.example .env.local
```

Edit `web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000.

## Mobile App Setup (Expo)

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Start Expo

```bash
npx expo start
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go.

**Note:** The mobile app currently requires the legacy Django backend running on `localhost:8000`. See the Docker guide for instructions. This will be migrated to Supabase.

## Legacy Django Backend (for mobile only)

Only needed if developing the mobile app before the Supabase migration is complete.

```bash
# From project root
docker-compose up -d
```

This starts PostgreSQL on port 5432 and Django on port 8000. See [docker_guide.md](docker_guide.md) for details.

## Supabase Database Types

To regenerate TypeScript types from the live database:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > shared/supabase/database.types.ts
```

Copy the output to `web/lib/supabase/database.types.ts` as well (until shared code deduplication is done).
