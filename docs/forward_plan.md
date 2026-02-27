# PhotosApp — Forward Plan

> Created: February 2026

This document outlines the recommended order of work to stabilize and complete PhotosApp. Each phase builds on the previous one. Estimated effort assumes a single developer.

---

## Phase 1: Fix Critical Mobile Crashes (1-2 days)

**Goal:** Make the mobile app stop crashing on launch/navigation.

1. Fix `apiClient` → `api` imports in `mobile/app/(app)/map.tsx` and `mobile/app/(app)/timeline/[narrativeId].tsx`
2. Fix `isLoading` → `loading` destructuring in `LoginScreen.tsx` and `RegisterScreen.tsx`
3. Move `useWindowDimensions()` before conditional returns in `mobile/app/index.tsx`
4. Replace `window.innerWidth` with `Dimensions.get('window').width` in `mobile/app/(app)/_layout.tsx`
5. Fix all broken route paths (7 occurrences — see [todo.md](todo.md))

**Validation:** App launches, login works, all navigation links resolve.

---

## Phase 2: Web Security & Auth Fixes (1 day)

**Goal:** Close security holes in the web auth flow.

1. Validate `next` query parameter in `web/app/auth/callback/route.ts` — ensure it starts with `/` and doesn't contain `//`
2. Handle email confirmation: after `signUp`, check if `user.confirmed_at` is null → show "check your email" message instead of redirecting
3. Read `?error=` param on login page and display error message
4. Add password confirmation field to registration form

**Validation:** OAuth callback rejects external URLs. Registration handles unconfirmed users gracefully.

---

## Phase 3: Migrate Mobile to Supabase (1-2 weeks)

**Goal:** Eliminate the Django backend dependency. This is the single most impactful task.

### Step 3a: Set up Supabase client for mobile
1. `cd mobile && npm install @supabase/supabase-js`
2. Create `mobile/lib/supabase.ts` using `createClient()` with `expo-secure-store` for token storage
3. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to app config

### Step 3b: Rewrite AuthContext
1. Replace Django JWT login/register with `supabase.auth.signInWithPassword()` / `supabase.auth.signUp()`
2. Replace token refresh interceptor with Supabase's built-in session management
3. Listen to `onAuthStateChange` for session updates
4. Remove SecureStore token management (Supabase handles it)

### Step 3c: Migrate screens one by one
For each screen, replace `api.getXxx()` calls with `supabase.from('table').select()`:

| Screen | Django Call | Supabase Equivalent |
|--------|-----------|---------------------|
| DashboardScreen | `api.getNarratives()` | `supabase.from('narratives').select('*')` |
| DashboardScreen | `api.getProjects()` | `supabase.from('projects').select('*')` |
| NarrativeDetailScreen | `api.getNarrative(id)` | `supabase.from('narratives').select('*').eq('id', id)` |
| ProjectDetailScreen | `api.getProject(id)` | `supabase.from('projects').select('*, project_narratives(*)')` |
| UploadScreen | `api.uploadMedia()` | `supabase.storage.from('media').upload()` + insert row |
| MapScreen | `api.getMediaItems()` | `supabase.from('media_items').select('*')` |

### Step 3d: Update types
- Import types from `shared/supabase/database.types.ts` instead of `shared/types/index.ts`
- Update field references: `file` → `file_url`, `owner` → `owner_id`, etc.

### Step 3e: Clean up
- Delete `mobile/shared/` directory
- Delete `shared/api/client.ts` and `shared/types/index.ts`
- Set up path alias to import from root `shared/`

**Validation:** Mobile app works entirely against Supabase. Docker is no longer needed.

---

## Phase 4: Retire Django Backend (1 day)

**Goal:** Remove legacy code and simplify the repo.

1. Move `backend/` to `_archive/backend/` (or delete if comfort level allows)
2. Delete `docker-compose.yml`
3. Update README to remove Django references
4. Update `docs/mobile_dev_guide.md` to reference Supabase instead of Docker

**Validation:** `git status` shows a leaner repository. No references to Django remain in active code.

---

## Phase 5: Deduplicate Shared Code (1 day)

**Goal:** Single source of truth for types and clients.

1. Auto-generate types: `npx supabase gen types typescript --project-id REF > shared/supabase/database.types.ts`
2. Make `web/lib/supabase/database.types.ts` re-export from `shared/supabase/database.types.ts`
3. Set up npm workspace or TypeScript path aliases so both `web/` and `mobile/` can import from `shared/`
4. Add a script to `package.json` at root: `"gen:types": "supabase gen types typescript --project-id $PROJECT_ID > shared/supabase/database.types.ts"`

**Validation:** Only one copy of `database.types.ts` exists as source. Both apps compile.

---

## Phase 6: Web Dashboard Features (1-2 weeks)

**Goal:** Make the web app actually useful beyond read-only display.

Priority order:
1. **Narrative CRUD** — Create, edit, delete narratives from dashboard
2. **Project CRUD** — Create, edit, delete projects
3. **Detail pages** — Narrative detail (with media grid), project detail (with narratives list)
4. **Media upload** — Drag-and-drop to Supabase Storage with EXIF extraction (client-side)
5. **Pagination** — Infinite scroll or "load more" for large datasets
6. **Image optimization** — Configure `images.remotePatterns` in `next.config.ts`
7. **Auth polish** — Forgot password, redirect authenticated users from login/register

---

## Phase 7: Mobile Polish & Completions (1-2 weeks)

**Goal:** Fill in all stub features and fix quality issues.

1. Implement settings persistence (save to `profiles` table)
2. Add narrative create/edit screen
3. Add project edit functionality
4. Implement actual cache clearing
5. Wire up pagination
6. Add auth guard on `(app)` layout
7. Implement web map view
8. Standardize on `expo-image` everywhere
9. Remove duplicate `GestureHandlerRootView`
10. Add React error boundaries
11. Fix `lineHeight` values

---

## Phase 8: Testing & Quality (ongoing)

**Goal:** Build confidence for production use.

1. Add Supabase integration tests (use a test project or local Supabase)
2. Add E2E tests for critical web flows (Playwright or Cypress)
3. Add mobile unit tests for auth and data fetching
4. Set up CI (GitHub Actions) with lint + type-check + test
5. Add pre-commit hooks for linting

---

## Summary Timeline

| Phase | Effort | Impact |
|-------|--------|--------|
| 1. Fix mobile crashes | 1-2 days | Unblocks mobile development |
| 2. Web security fixes | 1 day | Closes auth vulnerabilities |
| 3. Mobile → Supabase | 1-2 weeks | Eliminates dual-backend problem |
| 4. Retire Django | 1 day | Removes ~3,000 lines of legacy code |
| 5. Deduplicate shared | 1 day | Single source of truth |
| 6. Web features | 1-2 weeks | Makes web app functional |
| 7. Mobile polish | 1-2 weeks | Completes mobile feature set |
| 8. Testing | Ongoing | Production readiness |

**Total estimated effort: 5-8 weeks** for a single developer working part-time, with the first 3 phases being the highest priority.
