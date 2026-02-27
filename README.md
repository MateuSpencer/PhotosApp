# PhotosApp

A photo storytelling app that lets you organize photos into narratives, map your journeys, and tell your story through images. Built with **Next.js** (web), **React Native / Expo** (mobile), and **Supabase** (backend).

## Quick Start (Web App)

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/00001_initial_schema.sql
   ```
   This creates all tables, RLS policies, and triggers.
3. Note your **Project URL** and **Anon Key** from **Settings → API**.

### 2. Configure environment

```bash
cd web
cp .env.local.example .env.local
```

Edit `web/.env.local` and fill in your Supabase credentials:

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

Open [http://localhost:3000](http://localhost:3000) — you should see the landing page. Click **Create Account** to register, then you'll be taken to the dashboard.

### 4. Build for production

```bash
cd web
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects the `vercel.json` config — no manual setup needed.
4. Add these **Environment Variables** in the Vercel project settings:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

5. Click **Deploy**.

For more details, see [docs/vercel_supabase_deployment.md](docs/vercel_supabase_deployment.md).

## Project Structure

```
PhotosApp/
├── web/                    # Next.js web app (deployed on Vercel)
│   ├── app/                # App Router pages (login, register, dashboard)
│   ├── lib/supabase/       # Supabase client utilities & database types
│   └── middleware.ts       # Auth session middleware
├── mobile/                 # React Native / Expo mobile app
├── shared/                 # Shared TypeScript types & Supabase client
│   ├── supabase/           # Database types & client factory
│   └── types/              # App-wide type definitions
├── supabase/               # Supabase config & SQL migrations
│   └── migrations/         # Database schema (run in SQL Editor)
├── backend/                # Django REST API (legacy)
├── docs/                   # Documentation
└── vercel.json             # Vercel deployment config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | Next.js 16, React 19, Tailwind CSS |
| Mobile | React Native, Expo |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Deployment | Vercel |
| Legacy Backend | Django REST Framework (optional) |

## Database Schema

All tables use Row Level Security — users can only access their own data.

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (auto-created on signup) |
| `narratives` | Photo narratives / stories |
| `media_items` | Photos and videos with EXIF metadata |
| `notes` | Notes on narratives, media, or specific days |
| `locations` | Geographic locations |
| `projects` | Collections of narratives |

## License

Private repository.
