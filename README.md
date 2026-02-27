# PhotosApp

A photo storytelling app — organize photos into narratives, map your journeys, and tell your story through images. Built with **React Native / Expo** (runs on iOS, Android, and web) and **Supabase** (database, auth, storage).

## Architecture

One codebase, one backend:

```
PhotosApp/
├── mobile/          # Expo app — iOS, Android, and web
│   ├── app/         # Expo Router screens (file-based routing)
│   ├── src/         # Screens, components, contexts
│   ├── lib/         # Supabase client, DB types, shared types
│   └── assets/      # Icons, fonts, images
├── supabase/        # SQL migrations (run once in Supabase SQL Editor)
├── docs/            # Documentation
└── vercel.json      # Vercel deployment (Expo web export)
```

| Layer               | Technology                                 |
| ------------------- | ------------------------------------------ |
| App (iOS / Android) | React Native 0.76, Expo 52, Expo Router    |
| App (Web)           | Expo web export (React Native Web)         |
| UI                  | React Native Paper                         |
| Backend             | Supabase — PostgreSQL, Auth, Storage, RLS |
| Deployment          | Vercel (static Expo web build)             |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** and run:
   ```
   supabase/migrations/00001_initial_schema.sql
   ```
3. Note your **Project URL** and **Anon Key** from **Settings → API**.

### 2. Configure environment

```bash
cd mobile
		   # or create manually
```

Add your credentials to `mobile/.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run

```bash
cd mobile
npm install

# Native (requires Expo Go or dev build)
npx expo start

# Web browser only
npx expo start --web
```

### 4. Run on device / simulator

- **iOS**: Press `i` in the Expo terminal, or scan the QR code with the Expo Go app
- **Android**: Press `a`, or scan the QR code with Expo Go
- **Web**: Press `w`, or open [http://localhost:8081](http://localhost:8081)

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import at [vercel.com/new](https://vercel.com/new).
3. The `vercel.json` config handles everything — no framework preset needed.
4. Add these **Environment Variables** in Vercel project settings:
   | Variable                          | Value                     |
   | --------------------------------- | ------------------------- |
   | `EXPO_PUBLIC_SUPABASE_URL`      | Your Supabase project URL |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key    |
5. Click **Deploy**.

## Database Schema

All tables use Row Level Security — users can only access their own data.

| Table           | Description                            |
| --------------- | -------------------------------------- |
| `profiles`    | User profiles (auto-created on signup) |
| `narratives`  | Photo narratives / stories             |
| `media_items` | Photos and videos with EXIF metadata   |
| `notes`       | Notes attached to narratives or media  |
| `locations`   | Geographic locations                   |
| `projects`    | Collections of narratives              |

## License

Private repository.
