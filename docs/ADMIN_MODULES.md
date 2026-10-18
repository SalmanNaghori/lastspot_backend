# KhelBhai Admin Panel — Modules & Functional Specification

This document details all 11 core functional modules in the KhelBhai Admin Panel, their routing, permissions, database interactions, user flows, and operational procedures.

---

## 1. Authentication Module (`/login`, `/forgot-password`, `/reset-password`)
- **Route Paths**:
  - `/login`: Primary credential sign-in.
  - `/forgot-password`: Recovery email dispatch.
  - `/reset-password`: Update password callback handler.
- **Access Permission**: Public (unauthenticated). Redirects to `/dashboard` if a valid admin session already exists.
- **Key Features**:
  - Email format and minimum 6-character password validation with real-time blur feedback.
  - "Remember Me" toggle: stores authenticated session payload in `localStorage` when enabled, or `sessionStorage` (cleared on tab close) when disabled.
  - Custom session key: `khelbhai_admin_session` (with backward compatibility fallback to legacy `activity_admin_session`).
  - Strict role verification: Non-admin/moderator users are immediately rejected and signed out via `supabase.auth.signOut()`.
  - Recovery flow with deep-link redirection to `/reset-password`.

---

## 2. Platform Overview & Dashboard (`/dashboard`)
- **Route Path**: `/dashboard`
- **Required Permission**: `view_dashboard` (Available to `super_admin`, `admin`, `moderator`).
- **Data Source**: `adminRepo.getDashboardStats()`, `adminRepo.getRecentRequests()`, `adminRepo.getRecentUsers()`, `adminRepo.getRecentDevices()`.
- **Key Features**:
  - **User Analytics Matrix**:
    - Total Registered Users
    - Active Users (`status = 'active' AND deleted_at IS NULL`)
    - Suspended Users (`status = 'suspended'`)
    - Banned Users (`status = 'banned'`)
    - Soft Deleted Users (`deleted_at IS NOT NULL`)
  - **Activity & Device Matrix**:
    - Total Sports Activity Posts (with active/closed count)
    - Pending Join Applications awaiting approval
    - Total Connected Devices with platform breakdowns (Android, iOS, Web)
  - **Live Streams**:
    - Latest 5 user registrations (with click-through to inspect profile)
    - Latest 5 sports activity requests (with category badge and status)
    - Latest 5 active device heartbeats (with model and platform badges)
  - Interactive cards route directly to corresponding modules with pre-filtered parameters.

---

## 3. User Directory & Profile Inspection (`/users`, `/users/:id`)
- **Route Paths**:
  - `/users`: Paginated directory of platform users.
  - `/users/:id`: Comprehensive inspection and profile moderation console.
- **Required Permission**: `manage_users`.
- **Data Source**: Table `profiles` via `adminRepo.getUsers()` and `adminRepo.getUserById()`.
- **Key Features**:
  - **Search**: Case-insensitive search on `full_name` or email search via PostgreSQL RPC `search_users_by_email`.
  - **Filters**:
    - Status (`all`, `active`, `suspended`, `banned`, `deleted`).
    - City filter (linked dynamically with `cities` table).
  - **Action Dialogs (`AlertDialog`)**:
    - **Reactivation**: Resets account status to `active` and removes suspension reasons.
    - **Suspension**: Requires administrator reason and customer-facing explanation.
    - **Ban**: Permanent administrative ban with audit reason.
    - **Soft Delete**: Sets `deleted_at = NOW()` without destructive database purge, allowing full audit trails and reactivation.
  - **Connected Device Audit**:
    - Displays connected device telemetry: Model, OS version, App build, Last active timestamp, and FCM push token registration status.

---

## 4. Sports Activity Requests & Posts (`/requests`, `/requests/:id`)
- **Route Paths**:
  - `/requests`: Searchable directory of sports activity posts.
  - `/requests/:id`: Deep inspection of activity requirements, host profile, and applicant list.
- **Required Permission**: `manage_activities`.
- **Data Source**: Table `requests` joined with `profiles`, `categories`, `cities`, and `join_requests`.
- **Key Features**:
  - Multi-parameter search across post title, location venue, and creator.
  - Filters by category, city, and status (`open`, `completed`, `cancelled`).
  - **Create Activity Modal**:
    - Title, category picker, description, venue location, scheduled event date/time, required player headcount, and cost per head.
  - **Inspection Console**:
    - View activity host contact and profile completion.
    - Direct status transition triggers: Close Post, Re-publish.
    - Real-time list of interested user applicants with application notes and approval statuses.

---

## 5. Join Applications Module (`/join-requests`)
- **Route Path**: `/join-requests`
- **Required Permission**: `manage_join_requests`.
- **Data Source**: Table `join_requests` joined with `profiles` and `requests`.
- **Key Features**:
  - Overview of all member join requests across sports activities.
  - Filter by status: `pending`, `accepted`, `rejected`, `cancelled`.
  - Live search by applicant name or post title.
  - Direct links to inspect applicant profiles or the underlying activity post.

---

## 6. Activity Categories Management (`/categories`)
- **Route Path**: `/categories`
- **Required Permission**: `manage_categories`.
- **Data Source**: Table `categories` via `adminRepo.getCategories()`.
- **Key Features**:
  - Dynamic display ordering controls for mobile app layout customization.
  - Name, slug auto-generation, sports emoji / icon picker, and short description.
  - Quick toggle switch for instant activation / deactivation in the mobile app feed.
  - Create and edit dialog modals with validation.

---

## 7. City Coverage & Geographical Enablement (`/cities`)
- **Route Path**: `/cities`
- **Required Permission**: `manage_cities`.
- **Data Source**: Table `cities` via `adminRepo.getCities()`.
- **Key Features**:
  - Real-time statistics: Total Cities, Active Cities, Inactive Cities.
  - Status tabs: All, Active, Inactive with live search.
  - City creation and edit modal (City name, State, Display Order).
  - Safety-first confirmation modal: Deactivating a city warns that existing activities and users in that city are preserved while hiding the city from new onboarding selection.

---

## 8. Content & Dispute Moderation (`/reports`)
- **Route Path**: `/reports`
- **Required Permission**: `manage_reports`.
- **Data Source**: Table `reports` joined with `profiles`.
- **Key Features**:
  - Review flagged content, harassment reports, fraudulent activity posts, and impersonation claims.
  - Filter by status (`all`, `open`, `resolved`, `dismissed`).
  - Quick action controls:
    - **Dismiss**: Closes report with default audit log.
    - **Resolve**: Prompts administrator for resolution notes and marks report as resolved.

---

## 9. Registered Devices Inventory (`/devices`)
- **Route Path**: `/devices`
- **Required Permission**: `manage_devices`.
- **Data Source**: Table `user_devices` via `adminRepo.getDevices()`.
- **Key Features**:
  - Inventory of physical devices used to log in across the platform.
  - Platform tabs: All, Android, iOS, Web.
  - Hardware model, OS version, installed KhelBhai app version, build number, and relative last-active timestamp.
  - Searchable across device identifier, model, user name, and user email.

---

## 10. Broadcast Notifications Hub (`/notifications`, `/notifications-history`)
- **Route Paths**:
  - `/notifications`: Broadcast composer.
  - `/notifications-history`: Audit logs of all dispatched broadcasts.
- **Required Permission**: `manage_notifications`.
- **Data Source**: Table `notifications` via `adminRepo.getNotifications()`.
- **Key Features**:
  - Compose high-priority broadcasts with title and message body.
  - Target audience segmentation: All Registered Users, Category Interested, Location Radius.
  - Immediate send or scheduled dispatch with past-date validation.
  - Recipient count estimation and delivery audit tracking.

---

## 11. Admin Roles & System Remote Config (`/roles`, `/app-settings`)
- **Route Paths**:
  - `/roles`: Staff credential and RBAC role delegation.
  - `/app-settings`: Remote configuration, version enforcement, and feature flags.
- **Required Permissions**:
  - `/roles`: `manage_admin_roles`.
  - `/app-settings`: `manage_settings` (Super Admin restricted).
- **Key Features**:
  - **Admin Roles**:
    - Breakdown of Super Admins, Moderators, and Total Staff.
    - Assign existing user an admin role via RPC `set_user_role`.
    - Create new backoffice staff via secure Edge Function `create-admin-user`.
    - Revoke admin privileges via RPC `revoke_user_role`.
  - **Remote Config**:
    - Feature flags: In-app chat, Travel & carpooling, Sports scheduling.
    - Maintenance mode: Global maintenance switch and targeted version/platform rules.
    - Version control & Force Update: Minimum supported version, latest store version, store download URLs, and custom update prompt dialogs with bulleted release notes.
