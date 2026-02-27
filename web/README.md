# PhotosApp — Web

The Next.js web frontend for PhotosApp, deployed on [Vercel](https://vercel.com) with [Supabase](https://supabase.com) as the backend.

## Getting Started

### 1. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> You can find these values in your Supabase dashboard under **Settings → API**.

### 2. Install dependencies

```bash
npm install
```

### 3. Initialize the database

Before running the app for the first time, go to your Supabase project's **SQL Editor** and run the migration:

```
../supabase/migrations/00001_initial_schema.sql
```

This creates all the required tables, indexes, RLS policies, and triggers.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Registration page
│   ├── dashboard/page.tsx    # Main dashboard (protected)
│   └── auth/callback/        # OAuth callback handler
├── lib/supabase/
│   ├── client.ts             # Browser Supabase client
│   ├── server.ts             # Server-side Supabase client
│   ├── middleware.ts         # Auth session middleware
│   └── database.types.ts     # TypeScript types for all tables
├── middleware.ts              # Next.js middleware (auth guard)
└── .env.local.example         # Environment variable template
```

## Deploy to Vercel

See the [deployment guide](../docs/vercel_supabase_deployment.md) for full instructions.
