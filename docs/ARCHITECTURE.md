# KhelBhai Admin Panel — Architecture & System Design

This document details the architectural design, component relationships, data flow pipelines, and integration boundaries between the **KhelBhai Mobile App (Flutter)**, **Supabase Backend**, and **KhelBhai Admin Panel (React)**.

---

## 1. High-Level Ecosystem Architecture

```mermaid
flowchart TB
    subgraph MobileApp["KhelBhai Mobile Application (Flutter)"]
        FlutterUI["Flutter UI (Widgets / Blocs)"]
        SupabaseFlutter["supabase_flutter SDK"]
        FCMService["Firebase Cloud Messaging (FCM)"]
    end

    subgraph AdminPanel["KhelBhai Admin Panel (React 19 + Vite)"]
        AdminUI["React Admin UI (Tailwind + Radix)"]
        Router["React Router v7 (Lazy Loaded)"]
        AdminRepo["adminRepo (DAL Singleton)"]
        SupabaseClient["@supabase/supabase-js (Client Anon Key)"]
    end

    subgraph SupabaseCloud["Supabase Backend (Managed PostgreSQL)"]
        AuthService["GoTrue Auth Service"]
        PostgREST["PostgREST API Engine"]
        StorageEngine["Supabase Storage (Avatars / Assets)"]
        
        subgraph Database["PostgreSQL 15 Database"]
            Tables["Tables: profiles, requests, join_requests, categories, cities, user_devices, reports, notifications, app_settings, user_roles"]
            RLS["Row Level Security (RLS) Policies"]
            RPCs["Stored Functions / RPCs: search_users_by_email, set_user_role, revoke_user_role, get_user_devices_for_admin"]
        end

        subgraph EdgeFunctions["Deno Edge Functions"]
            EF1["create-admin-user (Service Role Key)"]
            EF2["get-user-devices (Service Role Key)"]
        end
    end

    FlutterUI --> SupabaseFlutter
    SupabaseFlutter --> AuthService
    SupabaseFlutter --> PostgREST
    FCMService --> FlutterUI

    AdminUI --> Router
    Router --> AdminRepo
    AdminRepo --> SupabaseClient
    SupabaseClient --> AuthService
    SupabaseClient --> PostgREST
    SupabaseClient --> EdgeFunctions

    PostgREST --> RLS
    RLS --> Tables
    EdgeFunctions --> Tables
    RPCs --> Tables
```

---

## 2. Authentication & Authorization Pipeline

The Admin Panel enforces a two-tier authentication and verification model:
1. Standard Supabase credential verification (`supabase.auth.signInWithPassword`).
2. Immediate role verification against the `user_roles` database table. Accounts lacking `super_admin`, `admin`, or `moderator` privileges are immediately ejected and signed out.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Staff Administrator
    participant UI as LoginPage.tsx
    participant Auth as AuthProvider & Supabase Auth
    participant DB as public.user_roles
    participant Router as ProtectedRoute Guard
    participant Layout as AdminLayout

    Admin->>UI: Enter email & password
    UI->>Auth: supabase.auth.signInWithPassword({ email, password })
    alt Authentication Fails
        Auth-->>UI: Return Auth Error (Invalid Credentials)
        UI-->>Admin: Display error toast notification
    else Authentication Succeeds
        Auth-->>UI: Session JWT & User Metadata
        UI->>DB: Query user_roles WHERE user_id = auth.uid()
        alt Not Staff Role (role not in super_admin, admin, moderator)
            DB-->>UI: Role is null or 'user'
            UI->>Auth: supabase.auth.signOut()
            UI-->>Admin: Show 'Access Denied: Unprivileged account'
        else Authorized Staff Role
            DB-->>UI: Return role ('super_admin' | 'admin' | 'moderator')
            UI->>UI: Store khelbhai_admin_session (localStorage/sessionStorage)
            UI->>Router: Navigate to /dashboard
            Router->>Router: Check getRequiredPermission(path) against useRBAC()
            alt Has Permission
                Router->>Layout: Render AdminLayout with filtered navigation
                Layout-->>Admin: Render requested feature screen
            else Missing Permission
                Router-->>Admin: Redirect to /dashboard
            end
        end
    end
```

---

## 3. RBAC Permissions Matrix

```mermaid
classDiagram
    class Roles {
        <<enumeration>>
        super_admin
        admin
        moderator
        user
    }

    class Permissions {
        +view_dashboard
        +manage_users
        +manage_activities
        +manage_join_requests
        +manage_reports
        +manage_chat
        +manage_cities
        +manage_categories
        +manage_notifications
        +manage_devices
        +manage_settings
        +manage_admin_roles
    }

    Roles <|-- super_admin : has all 12 permissions
    Roles <|-- admin : has 11 permissions (except manage_settings)
    Roles <|-- moderator : has 7 permissions (dashboard, users, activities, join, reports, chat, devices)
    Roles <|-- user : has 0 admin permissions
```

---

## 4. Module Dependency Graph

The codebase cleanly decouples UI views, business controllers, and data services:

```mermaid
graph TD
    subgraph UI_Layer["UI & Presentation Layer"]
        Views["Page Views (src/features/*)"]
        Components["Radix UI Primitives (src/components/ui/*)"]
        Layouts["AdminLayout & Common Dialogs (src/components/common/*)"]
    end

    subgraph App_Core["Application Core"]
        App["App.tsx"]
        Router["Router & ProtectedRoute (src/app/router/*)"]
        AuthProvider["AuthProvider (src/app/providers/AuthProvider)"]
        RBAC["useRBAC Hook (src/app/providers/useRBAC)"]
        Toast["ToastProvider (src/app/providers/ToastProvider)"]
    end

    subgraph Data_Layer["Data Access Layer (DAL)"]
        AdminRepo["adminRepo Singleton (src/lib/adminRepo.ts)"]
        AppStrings["AppStrings Dictionary (src/core/constants/app_strings.ts)"]
        ApiUrls["ApiUrls Mapping (src/core/constants/api_urls.ts)"]
        SupabaseClient["Supabase Client Singleton (src/core/supabase/client.ts)"]
    end

    subgraph Backend_Cloud["Backend & APIs"]
        SupabaseREST["Supabase PostgREST"]
        EdgeFuncs["Supabase Edge Functions"]
    end

    App --> Toast
    Toast --> AuthProvider
    AuthProvider --> Router
    Router --> Layouts
    Layouts --> Views
    Views --> Components
    Views --> AdminRepo
    Views --> AppStrings
    Views --> RBAC
    Layouts --> RBAC
    Layouts --> AppStrings

    AdminRepo --> ApiUrls
    AdminRepo --> SupabaseClient
    SupabaseClient --> SupabaseREST
    SupabaseClient --> EdgeFuncs
```

---

## 5. Supabase Data Flow & PostgREST Operations

```mermaid
flowchart LR
    subgraph AdminActions["Admin Actions"]
        A1["Search Users"]
        A2["Ban / Suspend User"]
        A3["Soft Delete User"]
        A4["Publish Broadcast"]
        A5["Toggle Category / City"]
        A6["Resolve Report"]
        A7["Inspect User Devices"]
    end

    subgraph DAL["ComprehensiveAdminRepository"]
        M1["adminRepo.getUsers()"]
        M2["adminRepo.banUser() / suspendUser()"]
        M3["adminRepo.softDeleteUser()"]
        M4["adminRepo.createNotification()"]
        M5["adminRepo.toggleCategoryActive() / toggleCityStatus()"]
        M6["adminRepo.resolveReport()"]
        M7["fetchUserDevices()"]
    end

    subgraph PostgREST_RPC["Supabase Endpoints"]
        E1["RPC: search_users_by_email"]
        E2["UPDATE: profiles (status, reason, message)"]
        E3["UPDATE: profiles (deleted_at = NOW)"]
        E4["INSERT: notifications"]
        E5["UPDATE: categories / cities (is_active)"]
        E6["UPDATE: reports (status = resolved)"]
        E7["Edge Function: get-user-devices / RPC get_user_devices_for_admin"]
    end

    A1 --> M1 --> E1
    A2 --> M2 --> E2
    A3 --> M3 --> E3
    A4 --> M4 --> E4
    A5 --> M5 --> E5
    A6 --> M6 --> E6
    A7 --> M7 --> E7
```

---

## 6. Notification Dispatch Architecture

Broadcasts dispatched by admins flow into PostgreSQL, triggering background notifications:

```mermaid
flowchart TD
    Admin["Admin Staff (NotificationsPage)"] -->|Form submit: title, message, audience, schedule| AdminRepo["adminRepo.createNotification()"]
    AdminRepo -->|INSERT into notifications table| DB[("public.notifications")]

    DB -->|Status: 'sent'| Realtime["Supabase Database Webhook / Realtime"]
    Realtime -->|Invoke Edge Function| PushWorker["push-notification-worker"]

    PushWorker -->|Query active FCM tokens| UserDevices[("public.user_devices WHERE is_active=true")]
    PushWorker -->|Batch Push Request| FCM["Firebase Cloud Messaging (FCM)"]

    FCM -->|Push Alert| MobileDevices["Mobile Users (Android / iOS Clients)"]
    DB -->|Read in-app notification| MobileInApp["Flutter In-App Notification Center"]
```

---

## 7. Shared Database Entities & Consistency Map

```mermaid
erDiagram
    PROFILES ||--o{ REQUESTS : "creates (user_id)"
    PROFILES ||--o{ JOIN_REQUESTS : "applies (user_id)"
    PROFILES ||--o{ USER_DEVICES : "owns (user_id)"
    PROFILES ||--o{ USER_ROLES : "assigned (user_id)"
    PROFILES ||--o{ REPORTS : "files (reporter_id)"
    CATEGORIES ||--o{ REQUESTS : "categorizes (category_id)"
    CITIES ||--o{ REQUESTS : "hosts (city_id)"
    CITIES ||--o{ PROFILES : "resides (city_id)"
    REQUESTS ||--o{ JOIN_REQUESTS : "receives (request_id)"

    PROFILES {
        uuid id PK
        string full_name
        string email
        string phone
        string avatar_url
        string status
        string status_reason
        string status_message
        timestamp status_expires_at
        timestamp deleted_at
        uuid city_id FK
        boolean is_profile_completed
        timestamp created_at
        timestamp updated_at
    }

    REQUESTS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        uuid city_id FK
        string title
        text description
        string location_name
        timestamp event_date_time
        int max_participants
        int current_participants
        string status
        timestamp created_at
        timestamp updated_at
    }

    JOIN_REQUESTS {
        uuid id PK
        uuid request_id FK
        uuid user_id FK
        string status
        text note
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        string name
        string slug
        string icon
        text description
        int display_order
        boolean is_active
        timestamp created_at
    }

    CITIES {
        uuid id PK
        string name
        string state
        boolean is_active
        int display_order
        timestamp created_at
    }

    USER_DEVICES {
        uuid id PK
        uuid user_id FK
        string platform
        string device_model
        string os_version
        string app_version
        string build_number
        string device_identifier
        text fcm_token
        boolean is_active
        timestamp last_active_at
    }

    REPORTS {
        uuid id PK
        uuid reporter_id FK
        string reported_type
        uuid reported_id
        string reason
        text description
        string status
        text resolution_notes
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        string title
        text message
        string target_audience
        string status
        timestamp scheduled_at
        int sent_count
        timestamp created_at
    }

    APP_SETTINGS {
        string key PK
        jsonb value
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        string role
        timestamp created_at
    }
```
