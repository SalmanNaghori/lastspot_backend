# KhelBhai Admin Panel — Architectural Decision Records (ADR)

This document catalogs key architectural decisions, rationale, context, and consequences governing the KhelBhai Admin Panel.

---

## ADR 001: Retention of Supabase PostgREST Table Names & API Contracts
- **Status**: Accepted
- **Context**: The project was rebranded from *LastSpot* to *KhelBhai*. The backend Supabase database and Flutter mobile application already interact with existing production tables (`profiles`, `requests`, `join_requests`, `categories`, `cities`, `user_devices`, `reports`, `notifications`, `app_settings`, `user_roles`).
- **Decision**: Retain all existing PostgreSQL table names, columns, RPC identifiers, storage bucket names, and environment variables without modification. Only visible branding, UI presentation strings, and client-side session keys are updated.
- **Consequences**:
  - Full backward compatibility with the existing Flutter mobile application.
  - Zero database migration risks or downtime.
  - Zero disruption to existing production data.

---

## ADR 002: Centralized Data Access Layer (`adminRepo.ts`)
- **Status**: Accepted
- **Context**: PostgREST queries can easily become scattered across UI components, leading to duplicate queries, inconsistent error handling, and tight coupling between views and backend schema.
- **Decision**: Encapsulate all Supabase database queries, RPC invocations, and pagination logic in a centralized Data Access Layer singleton (`src/lib/adminRepo.ts`).
- **Consequences**:
  - UI components remain lean and focused solely on presentation and user interaction.
  - Changes to underlying database queries or schema mappings only require updates in `adminRepo.ts`.
  - Simplifies mocking and automated testing.

---

## ADR 003: Two-Tier Auth Verification with Database-Backed RBAC
- **Status**: Accepted
- **Context**: Supabase Auth handles email/password validation and JWT issuance, but does not inherently restrict access to the Admin Panel. Regular users could log into the admin panel if authorization was not enforced.
- **Decision**: Implement a mandatory second verification step: immediately after `signInWithPassword`, query `public.user_roles` for the authenticated user ID. Only accounts with `role` matching `super_admin`, `admin`, or `moderator` are permitted. Any unprivileged user is signed out instantly.
- **Consequences**:
  - Eliminates unauthorized access from standard mobile application users.
  - Supports role delegations and permission granularity via `useRBAC` hook.

---

## ADR 004: Soft Deletion Strategy for User Accounts (`deleted_at`)
- **Status**: Accepted
- **Context**: In social and activity platforms, permanently deleting user accounts causes relational integrity failures across historical posts, join applications, chat history, and moderation audits.
- **Decision**: User deletion is implemented as a soft delete (`deleted_at = NOW()`). Soft-deleted users are excluded from standard mobile feeds and directory queries, but remain inspectable and reactivatable in the Admin Panel.
- **Consequences**:
  - Preserves relational integrity with zero foreign key cascade errors.
  - Provides administrators with full audit history and the ability to reverse accidental deletions.

---

## ADR 005: Route-Based Lazy Loading with React 19 Suspense
- **Status**: Accepted
- **Context**: Statically bundling 15+ rich admin pages into a single chunk produced a monolithic 684 kB payload, causing Vite bundle size warnings and degrading page load performance on slower administrative networks.
- **Decision**: Leverage dynamic `React.lazy()` imports for all feature routes in `src/app/router/index.tsx`, supported by `<React.Suspense>` boundaries in `App.tsx` and `AdminLayout.tsx`.
- **Consequences**:
  - Initial JavaScript bundle size decreased by over 55% (to 309 kB).
  - Feature pages load instantaneously on demand.
  - Build warnings are eliminated.

---

## ADR 006: Dual-Key Session Storage Migration Strategy
- **Status**: Accepted
- **Context**: The existing application stored session tokens under `activity_admin_session`. Abruptly switching keys could invalidate existing active admin sessions or cause synchronization issues.
- **Decision**: The authentication system writes to `khelbhai_admin_session` and cleans up `activity_admin_session`, while reading from `khelbhai_admin_session` with a fallback to `activity_admin_session`. On logout, both keys are thoroughly purged.
- **Consequences**:
  - Seamless migration for active administrator sessions without abrupt logouts.
  - Complete cleanup on logout preventing session leakage.

---

## ADR 007: Multi-Tier Resilient User Profile & Device Telemetry Retrieval
- **Status**: Accepted
- **Context**: Admin device inspection requires viewing devices owned by arbitrary user IDs. Direct PostgREST queries can be filtered by Row-Level Security (`auth.uid() = user_id`) unless admin policies are present, and remote Edge Functions or migrations may be deployed in stages.
- **Decision**: Implement a multi-tier resolution strategy in `adminRepo.ts` and `devices.ts`:
  1. Primary: Server-side Supabase Edge Functions (`get-user-details`, `get-user-devices`).
  2. Secondary: PostgreSQL `SECURITY DEFINER` RPC functions (`get_user_details_for_admin`, `get_user_devices_for_admin`).
  3. Tertiary: Direct PostgREST query on `public.profiles`, `public.cities`, and `public.user_devices`.
  4. Failure Handling: Explicit failure state with Retry mechanism; never mask database/network errors into empty arrays.
- **Consequences**:
  - Maximum reliability across local development, staging, and production environments.
  - Safe diagnostic logging with request IDs, latency, and status codes.
  - 100% protection against secret leakage (FCM tokens and hardware identifiers are never returned).

---

## ADR 008: Server-Side Email & Phone Fallback Resolution from `auth.users`
- **Context**: Older user accounts created before database profile email synchronization triggers often possess `email` and `phone` exclusively in Supabase `auth.users`, leaving `public.profiles.email` null. The browser client cannot possess the Supabase `service_role` key.
- **Decision**: Resolve missing contact details server-side within `get-user-details` Edge Function and `get_user_details_for_admin` RPC using the following fallback priority:
  - Email: `profiles.email` -> `auth.users.email` -> `auth.users.user_metadata.email`.
  - Phone: `profiles.phone` -> `auth.users.phone` -> `auth.users.user_metadata.phone`.
  - City / State: `public.cities` lookup via `profiles.city_id` -> `profiles.city`.
- **Consequences**:
  - Existing and older accounts display complete and accurate contact details in the admin portal.
  - Service-role privileges remain strictly confined to the backend.
  - Zero database mutations required to view existing data.

