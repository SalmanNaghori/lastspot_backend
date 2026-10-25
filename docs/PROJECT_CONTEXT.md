# KhelBhai Admin Panel — Project Context

## 1. Project Overview & Background
**KhelBhai** (formerly *LastSpot*) is a next-generation sports and social activity discovery platform. Users can create, discover, and join sporting activities, local games, tournaments, events, and ride-sharing/carpooling arrangements.

The platform ecosystem comprises:
- **Mobile Application**: Cross-platform client built with **Flutter**, delivering user-facing onboarding, activity feed, booking, team management, chat, and geolocation.
- **Backend Infrastructure**: Powered by **Supabase (PostgreSQL 15+)**, leveraging Supabase Auth, Row-Level Security (RLS) policies, Realtime, Storage buckets, and Deno-based Edge Functions.
- **Admin Panel (Backoffice Control Center)**: Single Page Application (SPA) built with **React 19, TypeScript, and Vite**, serving administrators, moderators, and support staff to supervise platform operations, resolve disputes, enforce security, and configure mobile runtime behaviors.

---

## 2. Technology Stack Breakdown
| Tier | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.2.8 | UI component library with Concurrent Mode |
| **Build Tooling** | Vite | 8.2.0 | Next-gen lightning-fast dev server and Rolldown/Rollup bundler |
| **Language** | TypeScript | ~6.0.2 | End-to-end static typing and interface contracts |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first CSS engine with `tailwindcss-animate` |
| **UI Primitives** | Radix UI | 1.1 - 2.3 | Headless accessible primitives (Dialog, Select, Avatar, Dropdown) |
| **Iconography** | Lucide React | 1.31.0 | Consistent iconography across admin modules |
| **Routing** | React Router DOM | 7.18.2 | Client-side routing with nested routes & code-splitting (`React.lazy`) |
| **Backend Integration** | `@supabase/supabase-js` | 2.112.3 | Official Supabase client for PostgREST, Auth, Storage, and Edge Functions |
| **Deployment** | GitHub Actions / Pages | CI/CD | Automated linting, type-checking, building, and static artifact deployment |

---

## 3. High-Level Folder Structure
```text
lastspot_backend/
├── .agents/                      # AI pair-programming rules & specifications
│   └── rules/
│       ├── project_context.md    # Master AI agent context & navigation guide
│       └── ui_animation_spec.md  # Motion physics & animation guidelines
├── .github/                      # CI/CD automation workflows
│   └── workflows/
│       ├── ci.yml                # PR & branch validation (lint, build)
│       ├── deploy.yml            # Production deployment to GitHub Pages
│       └── deploy-functions.yml  # Supabase Edge Functions deployment
├── docs/                         # Persistent architectural & operational documentation
│   ├── PROJECT_CONTEXT.md        # This file: Project purpose, stack, & current status
│   ├── ARCHITECTURE.md           # Mermaid architectural diagrams & data flows
│   ├── ADMIN_MODULES.md          # Comprehensive module-by-module breakdown
│   ├── DATABASE_SCHEMA.md        # Supabase database entities & schema relationships
│   ├── UI_UX_GUIDELINES.md       # Design system, tokens, accessibility, & motion
│   ├── CODE_REVIEW.md            # In-depth code review categorized by severity
│   ├── CHANGELOG.md              # Chronological history of modifications
│   ├── DECISIONS.md              # Architectural Decision Records (ADR)
│   └── DEVELOPMENT_SOP.md        # Standard Operating Procedures & workflows
├── public/                       # Static public assets
│   ├── favicon.svg               # KhelBhai branded sports motion SVG favicon
│   └── icons.svg                 # SVG sprite definitions
├── src/
│   ├── app/                      # Application core wrappers & routing
│   │   ├── providers/            # AuthProvider, ToastProvider, useRBAC hook
│   │   └── router/               # Route declarations, code splitting & ProtectedRoute
│   ├── components/               # Shared reusable UI & layout components
│   │   ├── brand/                # Official KhelBhai V2 Brand UI System (Sidebar, Header, Table, etc.)
│   │   ├── common/               # AdminLayout, AlertDialog, ToastNotification
│   │   └── ui/                   # Radix primitives (button, badge, card, dialog, table)
│   ├── core/                     # Platform-wide constants & infrastructure
│   │   ├── constants/            # api_urls.ts, app_strings.ts
│   │   └── supabase/             # Supabase client singleton initialization
│   ├── features/                 # Modular feature domains
│   │   ├── auth/                 # Login, Forgot Password, Reset Password
│   │   ├── categories/           # Activity categories management
│   │   ├── cities/               # City coverage & geographical enablement
│   │   ├── dashboard/            # Platform Overview metrics & recent stream
│   │   ├── devices/              # User device inventory & telemetry
│   │   ├── moderation/           # Content reports & dispute moderation
│   │   ├── notifications/        # Broadcast composer & dispatch history
│   │   ├── requests/             # Sports posts & Join Applications management
│   │   ├── roles/                # RBAC admin credentials & permission delegation
│   │   ├── settings/             # Remote config, maintenance mode, force update
│   │   └── users/                # User profile directory & account status lifecycle
│   ├── lib/
│   │   ├── adminRepo.ts          # Centralized Data Access Layer (DAL) repository
│   │   └── devices.ts            # Resilient multi-tier device retrieval with diagnostics
│   ├── App.tsx                   # Top-level application root with Suspense & ThemeProvider
│   ├── index.css                 # Global CSS rules, CSS custom properties, & tokens
│   └── main.tsx                  # React DOM root bootstrapping
├── supabase/                     # Supabase backend definitions
│   ├── config.toml               # Local Supabase CLI configuration
│   ├── functions/                # Deno TypeScript Edge Functions
│   │   ├── create-admin-user/    # Secure admin account provisioning via Service Role
│   │   ├── get-user-devices/     # Secure device inspection bypassing client RLS
│   │   └── get-user-details/     # Multi-source user profile & device retrieval (auth.users fallback)
│   └── migrations/               # PostgreSQL DDL migrations
│       ├── 20261018000000_admin_device_access.sql
│       └── 20261019000000_user_data_and_device_consistency.sql
├── package.json                  # Dependencies and build scripts (v2.0.0)
└── vite.config.ts                # Vite configuration with route aliases and base URL
```

---

## 4. Current Implementation Status
| Module | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Authentication** | Completed | Email/password login, remember-me persistence, password recovery link & reset flow |
| **RBAC Authorization** | Completed | 3 roles (`super_admin`, `admin`, `moderator`) with fine-grained route & action guards |
| **Dashboard** | Completed | KhelBhai Control Center overview with 10 KPI cards, recent users, posts, and device streams |
| **Users Directory** | Completed | Search by name/email/phone, status filters, city filter, pagination |
| **User Inspection** | Completed | Full specifications card, auth.users email fallback, decoupled state, complete device telemetry |
| **Activity Posts** | Completed | Filter by category, status, city; inspect applicants; change post status |
| **Join Applications**| Completed | View applicants, post ownership, status badges, applicant profiles |
| **Categories** | Completed | Icon, slug, display order, active toggle, create & edit modals |
| **Cities** | Completed | Coverage inventory, state mapping, active toggle, display order |
| **Moderation** | Completed | User reports queue, resolution notes, dismiss/resolve workflows |
| **Device Inventory** | Completed | Platform breakdown (Android/iOS/Web), OS, App version, last active telemetry |
| **Notifications** | Completed | Push/in-app broadcast composer with instant dispatch or future scheduling |
| **Admin Roles** | Completed | Super Admin / Moderator management, role assignment, admin creation Edge Function |
| **Remote Config** | Completed | Platform version enforcement, maintenance mode rules, feature flags |
| **Theme Engine** | Completed | Persistent Light/Dark/System modes with OS synchronization |

---

## 5. Development Branch & Working Tree
- **Current Active Branch**: `feature/khelbhai-admin-v2`
- **Base Branch**: `main`
- **Working Tree Cleanliness**: Verified via `git status`. All modifications are grouped into logical commits.
