# Changelog — KhelBhai Admin Panel

All notable changes to the KhelBhai Admin Panel will be documented in this file.

---

## [2.0.0] — 2026-10-25

### 🎨 Official KhelBhai Brand Design & Visual Asset System (Admin V2)
- **Official Brand Design Language**:
  - Adopted the official Flutter mobile visual identity, replacing all legacy ActivityConnect navy/green branding.
  - Implemented centralized brand color tokens:
    - Primary Orange: `#F46A35`, Hover: `#DC5425`
    - Warm Amber: `#FFB45E`, Hover: `#EAA04C`
    - Light Background: `#FFF8F1`, Light Surface: `#FFFFFF`, Light Subtle: `#FDF3E7`, Light Border: `#F0E4DA`
    - Primary Dark Text: `#171D2A`, Muted Text: `#697386`
    - Dark Background: `#12141B`, Dark Surface: `#20232D`, Dark Subtle: `#181B24`, Dark Border: `#2E3442`
    - Dark Primary Text: `#FFF8F1`, Dark Muted Text: `#9CA3AF`
  - Integrated complete CSS variable system (`:root, [data-theme="light"]` and `.dark, [data-theme="dark"]`).
- **Comprehensive Theme Engine**:
  - Created `ThemeProvider` supporting `Light`, `Dark`, and `System` color scheme modes.
  - Added real-time sync with OS `prefers-color-scheme` media query.
  - Persisted user preference under `'khelbhai_admin_theme'` in `localStorage`.
  - Added `AdminThemeToggle` with segmented and icon-only display variants.
- **Official Vector Assets & 3D Sports Illustration Engine**:
  - Designed custom `KhelBhaiLogo` with kinetic sports shield emblem, gradient fill, and brand typography.
  - Created vector 3D sports illustration system (`SportsIllustration.tsx`):
    - `login_hero`: Multi-sport dynamic 3D composition with cricket, football, basketball, and tennis elements.
    - `empty_users`, `empty_activities`, `empty_devices`, `empty_notifications`, `empty_reports`, `empty_general`: Tailored context-aware illustrations for clean empty states.
- **Admin UI Component System**:
  - `AdminSidebar`: Brand logo, grouped route sections, active orange glow indicator, staff profile card, and embedded theme toggle.
  - `AdminHeader`: Sticky glassmorphic top bar, live system heartbeat indicator, and quick theme toggle.
  - `AdminPageHeader`: Standardized title, subtitle, count badge, and contextual action slots.
  - `AdminStatCard`: KPI cards with brand orange accents and smooth hover elevation.
  - `AdminDataTable`: High-performance data table with sticky headers, pagination, built-in loading skeletons, and illustration empty states.
  - `AdminSearchBar` & `AdminFilterBar`: Standardized search inputs with clear triggers and scrollable filter pills.
  - `AdminStatusBadge`: Accessible high-contrast status tags across users, devices, requests, and reports.
  - `AdminFormField`: Consistent form wrapper with validation feedback.
  - `AdminModal`: Glassmorphic modal dialog with backdrop blur, escape key, and click-outside dismissal.
  - `AdminEmptyState`: Illustrated empty state with customizable call-to-actions.
  - `AdminLoadingSkeleton`: Cohesive shimmer skeletons for tables, cards, and profiles.
  - `AdminErrorState`: Branded failure screen with diagnostic request details and retry button.
- **Full Route Redesign**:
  - Completely migrated: Login, Forgot Password, Reset Password, Dashboard, Users, User Details, Devices, Requests, Join Requests, Categories, Cities, Notifications, Notification History, Reports, App Settings, and Admin Roles.
- **Verification & Zero Regressions**:
  - Preserved 100% of the resilient multi-tier device retrieval telemetry (`get-user-devices` -> RPC -> PostgREST).
  - Preserved 100% of user profile completeness with `auth.users` fallback.
  - Strictly enforced type-only imports for `verbatimModuleSyntax` compatibility.
  - Passed production build verification (`tsc -b && vite build` -> 0 errors).

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
  - Designed and deployed custom high-resolution SVG favicon (`public/favicon.svg`).
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

### 🐛 Bug Fixes & Code Quality
- **ESLint & React 19 Compliance**:
  - Fixed synchronous `setState` in `useEffect` in `src/features/users/pages/UserDetailsPage.tsx`.
  - Removed unused `Layers` import in `UserDetailsPage.tsx`.
  - Added missing `cityFilter` dependency into `useEffect` in `src/features/users/pages/UsersPage.tsx`.
  - Corrected TypeScript button `onClick` event handler signature in `UserDetailsPage.tsx`.
  - Achieved clean static analysis pass (`npm run lint` -> 0 errors).
  - Achieved clean production build verification (`npm run build` -> 0 errors).
