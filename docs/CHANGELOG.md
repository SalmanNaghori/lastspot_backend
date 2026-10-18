# Changelog — KhelBhai Admin Panel

All notable changes to the KhelBhai Admin Panel will be documented in this file.

---

## [1.0.1] — 2026-10-19

### 🛡️ User Data & Device Consistency Engine
- **Intermittent Device Retrieval Resolution**:
  - Implemented multi-tier resilient device retrieval in `devices.ts` (`get-user-devices` Edge Function -> `get_user_devices_for_admin` RPC -> direct PostgREST with RLS fallback).
  - Resolved 0-device masking: Added distinct UI and API states (`loading`, `success with data`, `success with 0 records`, `error with retry`).
  - Added safe, structured diagnostic telemetry (`generateRequestId`, `logDiagnostic`) tracking endpoint, latency, query count, status code, and environment without logging secrets or FCM tokens.
- **Older & Existing User Profile Data Completeness**:
  - Created `get-user-details` Supabase Edge Function with secure `auth.users` fallback for email and phone.
  - Added PostgreSQL migration `20261019000000_user_data_and_device_consistency.sql` introducing admin RLS policies and `get_user_details_for_admin` RPC.
  - Linked `public.cities` relation to resolve `city` name and `state` for accounts with legacy or foreign-key-only location fields.
  - Enhanced `UserDetailsPage.tsx` with a Comprehensive Profile Specifications card displaying all available attributes, copy-to-clipboard helpers, and clear "Not provided" fallbacks for genuinely absent data.
  - Decoupled user profile and device retrieval via `Promise.allSettled`, eliminating race conditions and avoiding React 19 compiler cascading render warnings.

---

## [1.0.0] — 2026-10-18

### 🎨 Rebranding & Visual Identity
- **Application Rebranding**:
  - Rebranded application from **LastSpot / ActivityConnect** to **KhelBhai Admin**.
  - Updated dashboard banner to **KhelBhai Control Center**.
  - Updated browser `<title>` to `KhelBhai Admin — Control Center` with customized meta tags.
  - Designed and deployed custom high-resolution SVG favicon (`public/favicon.svg`) featuring the KhelBhai sports motion shield and emerald badge.
  - Rebranded Login, Forgot Password, and Reset Password authentication screens with KhelBhai branding, badges, and sports activity themes.
  - Modernized desktop and mobile sidebars with KhelBhai branding and `ADMIN` badge.
  - Updated centralized UI dictionary in `src/core/constants/app_strings.ts`.

### ⚡ Performance & Optimization
- **Route Code Splitting**:
  - Converted monolithic route imports in `src/app/router/index.tsx` to dynamic `React.lazy()` chunking.
  - Wrapped `AdminLayout` and root `App.tsx` with `React.Suspense` fallback spinners.
  - Reduced main production JavaScript bundle by over 55% from 684 kB down to 309 kB.
  - Completely resolved Vite bundle size warning.

### 🛡️ Security & State Reliability
- **Session Lifecycle & Storage Cleanup**:
  - Migrated session keys to `khelbhai_admin_session` while preserving backward compatibility for legacy `activity_admin_session`.
  - Fixed `signOut()` in `AuthProvider.tsx` to reliably purge session keys from both `localStorage` and `sessionStorage`.
  - Hardened authentication flow to prevent unprivileged accounts from retaining cached admin tokens.

### 🐛 Bug Fixes & Code Quality
- **ESLint & React 19 Compliance**:
  - Fixed synchronous `setState` in `useEffect` in `src/features/users/pages/UserDetailsPage.tsx`, eliminating the `react-hooks/set-state-in-effect` compiler error.
  - Removed unused `Layers` import in `UserDetailsPage.tsx`.
  - Added missing `cityFilter` dependency into `useEffect` in `src/features/users/pages/UsersPage.tsx`.
  - Corrected TypeScript button `onClick` event handler signature in `UserDetailsPage.tsx`.
  - Achieved clean static analysis pass (`npm run lint` -> 0 errors).
  - Achieved clean production build verification (`npm run build` -> 0 errors).

### 📚 Comprehensive Documentation Suite
- Created complete documentation suite under `docs/`:
  - `docs/PROJECT_CONTEXT.md`
  - `docs/ARCHITECTURE.md`
  - `docs/ADMIN_MODULES.md`
  - `docs/DATABASE_SCHEMA.md`
  - `docs/UI_UX_GUIDELINES.md`
  - `docs/CODE_REVIEW.md`
  - `docs/CHANGELOG.md`
  - `docs/DECISIONS.md`
  - `docs/DEVELOPMENT_SOP.md`
- Created AI-agent persistent instruction file in `.agents/rules/project_context.md`.
- Updated `README.md` with accurate React 19, TypeScript, and Vite specifications.

### 🔧 Repository & Tooling
- **Git & Environment Hygiene**:
  - Implemented comprehensive `.gitignore` covering dependencies, build artifacts, environments, keys, and IDE/OS files.
  - Added `.env.example` template for streamlined team onboarding and CI reference.
