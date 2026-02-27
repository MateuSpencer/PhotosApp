# PhotosApp — Active Todo

> Last updated: February 2026

## P0 — Critical (Fix Before Any New Features)

### Mobile Runtime Crashes
- [ ] Fix `apiClient` import in `mobile/app/(app)/map.tsx` — should be `api` from `mobile/shared/api/client`
- [ ] Fix `apiClient` import in `mobile/app/(app)/timeline/[narrativeId].tsx` — same issue
- [ ] Fix `isLoading` destructuring in LoginScreen/RegisterScreen — context exports `loading`, not `isLoading`
- [ ] Fix Rules of Hooks violation in `mobile/app/index.tsx` — `useWindowDimensions()` called after conditional return
- [ ] Fix `window.innerWidth` in `mobile/app/(app)/_layout.tsx` — crashes on native; use `Dimensions` or `useWindowDimensions`

### Mobile Broken Navigation
- [ ] Fix route `/(app)/projects/${id}` → `/(app)/project/${id}` in DashboardScreen
- [ ] Fix route `/(app)/narratives/${id}` → `/(app)/narrative/${id}` in DashboardScreen, ProjectDetailScreen, UploadScreen
- [ ] Remove reference to non-existent `/(app)/explore` route in DashboardScreen
- [ ] Remove reference to non-existent `/(app)/narratives/create` in ProjectDetailScreen

### Web Security
- [ ] Fix open redirect in `web/app/auth/callback/route.ts` — validate `next` param is a relative path
- [ ] Handle email confirmation flow in register page — show "check your email" instead of redirecting to dashboard

## P1 — High Priority (Architecture Cleanup)

### Eliminate Django Backend
- [ ] Add `@supabase/supabase-js` to mobile `package.json`
- [ ] Create Supabase client for mobile (using `expo-secure-store` for token persistence)
- [ ] Rewrite `AuthContext.tsx` to use Supabase Auth instead of Django JWT
- [ ] Migrate each mobile screen's API calls from axios/Django to Supabase queries
- [ ] Verify all mobile screens work with Supabase
- [ ] Archive `backend/` directory (move to `_legacy/backend/` or delete)
- [ ] Remove `docker-compose.yml` (no longer needed)
- [ ] Remove `shared/api/client.ts` (Django axios client)
- [ ] Remove `shared/types/index.ts` (Django-shaped types)

### Deduplicate Shared Code
- [ ] Delete `mobile/shared/` directory
- [ ] Set up path aliases or npm workspace so mobile imports from root `shared/`
- [ ] Consolidate `web/lib/supabase/database.types.ts` — import from `shared/supabase/database.types.ts`
- [ ] Auto-generate `database.types.ts` via `supabase gen types typescript` and commit

## P2 — Medium Priority (Feature Completeness)

### Web Dashboard — Make Interactive
- [ ] Add "Create Narrative" button and form
- [ ] Add "Create Project" button and form
- [ ] Make narrative/project cards clickable → detail pages
- [ ] Add narrative detail page with media grid
- [ ] Add project detail page with narratives list
- [ ] Add media upload flow (drag-and-drop to Supabase Storage)
- [ ] Add pagination or infinite scroll for large datasets
- [ ] Configure `images.remotePatterns` in `next.config.ts` for Supabase Storage URLs

### Web Auth Improvements
- [ ] Add password confirmation field to registration
- [ ] Add "Forgot password" flow (Supabase `resetPasswordForEmail`)
- [ ] Display auth callback errors on login page (read `?error=` param)
- [ ] Redirect authenticated users away from `/login` and `/register`
- [ ] Add password strength indicator

### Mobile — Complete Stubs
- [ ] Implement settings persistence (save preferences to profile)
- [ ] Implement actual cache clearing logic
- [ ] Add narrative create/edit screen
- [ ] Add project edit functionality
- [ ] Implement web map view (currently "coming soon")
- [ ] Wire up pagination for list screens
- [ ] Add auth guard on `(app)` layout for deep link protection
- [ ] Update copyright year to 2026 in settings

## P3 — Low Priority (Cleanup & Quality)

### Mobile Code Quality
- [ ] Remove duplicate `GestureHandlerRootView` wrapper (only need it in root layout)
- [ ] Standardize on `expo-image` everywhere (remove `react-native` Image imports)
- [ ] Fix `lineHeight: 1.2` → pixel value in `mobile/app/index.tsx`
- [ ] Remove unused `PROVIDER_GOOGLE` import in MapView
- [ ] Remove dead upload logic in UploadScreen (unused `FormData` / blob)
- [ ] Add React error boundaries

### Backend Cleanup (if keeping temporarily)
- [ ] Remove unused packages from `requirements.txt` (`django-ratelimit`, `requests`)
- [ ] Remove dead code: `BatchUploadSerializer`, `process_uploaded_media()`, unused ViewSets
- [ ] Extract `IsOwnerOrReadOnly` into a shared `permissions.py`
- [ ] Replace all `print()` with `logging`
- [ ] Fix `MEDIA_ROOT` collision with `media` app directory

### Documentation
- [x] Rewrite `architecture.md` for current stack
- [x] Rewrite `development_milestones.md` to reflect actual progress
- [x] Rewrite `todo.md` (this file)
- [x] Delete duplicate `Running Narratives App Locally.md`
- [ ] Rewrite `environment_setup.md` for current stack
- [ ] Rewrite `local_dev_guide.md` for current stack
- [ ] Rewrite `docker_guide.md` (label as legacy)
- [ ] Rewrite `user_guide.md` for current state
