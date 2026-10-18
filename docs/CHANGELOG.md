# Changelog — KhelBhai Admin Panel

All notable changes to the KhelBhai Admin Panel will be documented in this file.

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
