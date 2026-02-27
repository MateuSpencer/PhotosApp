# Deploying PhotosApp on Vercel with Supabase

This guide covers how to deploy the PhotosApp web application on [Vercel](https://vercel.com) using [Supabase](https://supabase.com) as the backend.

## Architecture Overview

- **Frontend**: Next.js web app (deployed on Vercel)
- **Backend**: Supabase (PostgreSQL database, Auth, Storage)
- **Mobile**: React Native / Expo app (connects to the same Supabase backend)

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account
- Node.js 18+ installed locally
- Git

## 1. Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Note your project's **URL** and **anon key** from **Settings > API**.

### Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**.
2. Copy the contents of `supabase/migrations/00001_initial_schema.sql` and run it.
3. This creates all tables, indexes, RLS policies, and triggers.

### Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard.
2. Create a bucket named `media` (set to private).
3. Create a bucket named `avatars` (set to public).
4. Add the following storage policies via **SQL Editor**:

```sql
-- Users can upload their own media
create policy "Users can upload their own media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own media
create policy "Users can view their own media"
  on storage.objects for select
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own media
create policy "Users can delete their own media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

-- Avatar images are publicly accessible
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users can upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
```

### Configure Authentication

1. Go to **Authentication > Providers** in your Supabase dashboard.
2. Email/Password is enabled by default.
3. (Optional) Enable additional OAuth providers (Google, GitHub, etc.).
4. Under **URL Configuration**, set your Site URL to your Vercel deployment URL.

## 2. Deploy to Vercel

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Vercel will auto-detect the `vercel.json` configuration.
4. Add the following **Environment Variables** in the Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

5. Click **Deploy**.

### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to the project root
cd PhotosApp

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 3. Local Development

### Set Up Environment Variables

```bash
cd web
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Run the Development Server

```bash
cd web
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## 4. Connect the Mobile App

The mobile app can also connect to Supabase. Use the shared Supabase client from `shared/supabase/client.ts`:

```typescript
import { createSupabaseClient } from '../shared/supabase/client';

const supabase = createSupabaseClient(
  'https://your-project-ref.supabase.co',
  'your-anon-key-here'
);
```

## Project Structure

```
PhotosApp/
├── web/                    # Next.js web app (deployed on Vercel)
│   ├── app/                # App router pages
│   ├── lib/supabase/       # Supabase client utilities
│   └── middleware.ts       # Auth middleware
├── mobile/                 # React Native / Expo mobile app
├── shared/                 # Shared code (types, Supabase client)
│   ├── supabase/           # Supabase client & database types
│   └── types/              # TypeScript type definitions
├── supabase/               # Supabase configuration
│   └── migrations/         # SQL migration files
├── backend/                # Django backend (legacy, optional)
└── vercel.json             # Vercel deployment configuration
```

## Database Schema

The Supabase database mirrors the original Django models:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (auto-created on signup) |
| `narratives` | Photo narratives/stories |
| `media_items` | Photos and videos |
| `notes` | User notes on narratives/media |
| `locations` | Geographic locations |
| `projects` | Collections of narratives |
| `project_narratives` | Project-narrative associations |
| `location_media` | Location-media associations |

All tables have Row Level Security (RLS) enabled. Users can only access their own data.
