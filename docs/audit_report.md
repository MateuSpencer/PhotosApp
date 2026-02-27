# PhotosApp — Comprehensive Audit Report

> Generated: February 2026

## Executive Summary

PhotosApp is a photo storytelling app with **three frontends** (web, mobile, legacy React prototype) and **two backends** (Supabase, Django). The web app has been successfully migrated to Supabase + Next.js, but the mobile app still depends on the legacy Django backend. The codebase has significant duplication, broken routes, runtime crashes in mobile, and 13 of 15 documentation files were outdated.

**The single biggest issue:** the Django backend is a full duplicate of Supabase and should be retired once mobile is migrated.

---

## Severity Summary

| Severity | Count | Category |
|----------|-------|----------|
| **CRITICAL** | 5 | Mobile runtime crashes (wrong imports, hooks violation) |
| **HIGH** | 12 | Broken routes, security issues, architectural duplication |
| **MEDIUM** | 15+ | Dead code, missing features, incomplete stubs |
| **LOW** | 10+ | Code quality, unused imports, inconsistencies |

---

## 1. Architecture Issues

### 1.1 Dual Backend (CRITICAL)
The entire Django backend (`backend/`) is duplicated by Supabase:

| Django Model | Supabase Table | Status |
|---|---|---|
| User + Profile | `profiles` | Fully duplicated |
| Narrative | `narratives` | Fully duplicated |
| MediaItem | `media_items` | Fully duplicated |
| Note | `notes` | Fully duplicated |
| Location | `locations` | Fully duplicated |
| Project | `projects` | Fully duplicated |

The web app uses Supabase. The mobile app uses Django. Both exist simultaneously.

### 1.2 Triple-Duplicated Shared Code (HIGH)
Three copies of shared code exist and can silently drift:

| Location | Contents | Used By |
|---|---|---|
| `shared/api/client.ts` | Django REST client (port 9000) | **Nothing** (dead) |
| `mobile/shared/api/client.ts` | Django REST client (port 8000) | Mobile app |
| `shared/types/index.ts` | Django-shaped types | **Nothing** (dead) |
| `mobile/shared/types/index.ts` | Django-shaped types (identical) | Mobile app |
| `shared/supabase/database.types.ts` | Supabase types | **Nothing** (dead) |
| `web/lib/supabase/database.types.ts` | Supabase types (identical copy) | Web app |

### 1.3 Two Incompatible Type Systems (HIGH)
Django types use numeric IDs and field names like `file`, `owner`, `cover_image`.
Supabase types use UUIDs and names like `file_url`, `owner_id`, `cover_image_url`.
Code importing from both will have type mismatches.

---

## 2. Mobile App Issues

### 2.1 Runtime Crashes (CRITICAL)
- `map.tsx` and `timeline/[narrativeId].tsx` import `apiClient` from root `shared/`, but the export is named `api` → **undefined at runtime**
- `index.tsx` calls `useWindowDimensions()` after a conditional return → **Rules of Hooks violation**
- `(app)/_layout.tsx` uses `window.innerWidth` → **crashes on native** (no `window` object)
- LoginScreen/RegisterScreen destructure `isLoading` from `useAuth()`, but the context exports `loading` → **isLoading is always undefined**

### 2.2 Broken Navigation (HIGH)
7 route references point to non-existent paths:
- `/(app)/projects/${id}` → should be `/(app)/project/${id}`
- `/(app)/narratives/${id}` → should be `/(app)/narrative/${id}`
- `/(app)/explore` → does not exist
- `/(app)/narratives/create` → does not exist
- `/(app)/narratives` → does not exist

### 2.3 Incomplete/Stub Features (MEDIUM)
- Settings toggles are local state only — never persisted
- Cache clearing shows an alert but does nothing
- Project edit has empty `onPress`
- Narrative create/edit screen doesn't exist
- Web map view shows "coming soon"
- No pagination on any list screen
- Copyright year hardcoded as 2024

### 2.4 Code Quality (LOW-MEDIUM)
- Duplicate `GestureHandlerRootView` in root and app layouts
- Mixed `expo-image` and `react-native` Image imports
- `lineHeight: 1.2` (must be pixels in RN)
- Dead upload logic in UploadScreen (blob created but unused)
- No auth guard on `(app)` group — deep links bypass auth

---

## 3. Web App Issues

### 3.1 Security (HIGH)
- **Open redirect** in `auth/callback/route.ts` — `next` query param used without validation
- **Registration flow** — redirects to dashboard even if email confirmation is required
- Auth callback errors silently discarded (login page doesn't read `?error=` param)

### 3.2 Missing Features (MEDIUM)
- Dashboard is **entirely read-only** — no create/edit/upload buttons
- No narrative or project detail pages
- No password reset ("forgot password") flow
- No password confirmation field on registration
- No `images.remotePatterns` in `next.config.ts` (will break `<Image>` with Supabase URLs)
- No pagination or infinite scroll
- No redirect for authenticated users on `/login`/`/register`

### 3.3 Code Quality (LOW)
- Dead CSS: `@theme inline` font variables never set; dark-mode CSS variables overridden by Tailwind
- Non-null assertions (`!`) on env vars — cryptic errors if missing
- `database.types.ts` is hand-maintained, risks drift from actual schema

---

## 4. Django Backend Issues

### 4.1 Security (HIGH)
- `SECRET_KEY` fallback is a known hardcoded string
- `CORS_ALLOW_ALL_ORIGINS = True` makes the explicit CORS whitelist dead code
- OAuth tokens (`google_photos_token`, etc.) stored as plaintext — no encryption
- `owner=null` allowed on all models — breaks `IsOwnerOrReadOnly` permission
- Password change doesn't invalidate existing JWT tokens
- Dockerfile runs as root with Django dev server

### 4.2 Dead Code & Bloat (MEDIUM)
- `BatchUploadSerializer` — defined but never used
- `process_uploaded_media()` — complete function, never called
- `UserViewSet`, `ProfileViewSet` — never registered in URL config
- `django-ratelimit`, `requests` packages in requirements — never imported
- EXIF extraction duplicated between `views.py` and `utils.py`
- `IsOwnerOrReadOnly` copy-pasted identically in 3 files
- Duplicate URL prefixes: `/api/` and `/api/v1/` serve the same endpoints
- `MEDIA_ROOT` collides with the `media` app directory
- `api/views.py` contains zero code (boilerplate only)
- All `print()` instead of `logging`

### 4.3 Test Coverage (LOW)
- `media/tests.py` has 2 trivial tests
- `narratives/tests.py`, `users/tests.py`, `locations/tests.py` are empty boilerplate

---

## 5. Documentation Issues (Fixed)

13 of 15 docs were outdated, referencing the old Django+React prototype. All have been rewritten:

| Document | Was | Now |
|---|---|---|
| `architecture.md` | Django+React+Three.js | Next.js+Supabase+Expo |
| `development_milestones.md` | 14-week Django plan | Actual completed milestones |
| `todo.md` | All items checked off | Active prioritized task list |
| `environment_setup.md` | Create React App + venv | Next.js + Expo + Supabase |
| `local_dev_guide.md` | `cd frontend` + Django Allauth | Current stack with correct paths |
| `docker_guide.md` | 3 services (fake frontend) | Legacy backend only, labeled clearly |
| `user_guide.md` | Dead Manus VM links, simulated auth | Current features and limitations |
| `Running Narratives App Locally.md` | Exact duplicate of local_dev_guide | **Deleted** |
| `vercel_supabase_deployment.md` | Already current | No changes needed |
| `mobile_dev_guide.md` | Partially outdated | Needs Supabase update after migration |

---

## 6. Bloat Assessment

### Files/Directories That Can Be Removed

| Path | Reason | Blocked By |
|---|---|---|
| `backend/` (entire directory) | Supabase replaces it | Mobile still depends on it |
| `docker-compose.yml` | Only serves Django backend | Mobile still depends on it |
| `shared/api/client.ts` | Django REST client, unused | Nothing |
| `shared/types/index.ts` | Django types, unused | Nothing |
| `mobile/shared/` | Duplicate of root `shared/` | Need path alias setup |
| `backend/media/utils.py` `process_uploaded_media()` | Dead function | Nothing |
| `backend/users/views.py` `UserViewSet`/`ProfileViewSet` | Dead classes | Nothing |
| `backend/media/serializers.py` `BatchUploadSerializer` | Dead class | Nothing |

### Packages That Can Be Removed

**Backend (`requirements.txt`):**
- `django-ratelimit` — never imported
- `requests` — never imported

**Mobile (`package.json`):**
- No unused packages identified; dependencies are appropriate for the feature set
