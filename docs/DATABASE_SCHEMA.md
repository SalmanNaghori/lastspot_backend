# KhelBhai Database Schema & Integration Reference

This document provides a technical specification of the Supabase PostgreSQL database tables, columns, constraints, foreign keys, stored RPC functions, and Edge Functions utilized across both the **KhelBhai Mobile App (Flutter)** and the **KhelBhai Admin Panel (React)**.

---

## 1. Table Definitions

### `public.profiles`
Stores user profile information, authentication metadata, and platform account status.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE` | Auth user identifier |
| `full_name` | `text` | `NULLABLE` | Display name of the user |
| `email` | `text` | `NULLABLE` | Primary email address |
| `phone` | `text` | `NULLABLE` | Primary mobile contact |
| `avatar_url` | `text` | `NULLABLE` | Public storage URL for profile image |
| `status` | `text` | `DEFAULT 'active'` | Current status: `'active'`, `'suspended'`, `'banned'` |
| `status_reason`| `text` | `NULLABLE` | Administrator audit reason for status change |
| `status_message`| `text` | `NULLABLE` | Customer-facing explanation shown in mobile app |
| `status_expires_at`| `timestamptz`| `NULLABLE` | Automatic expiry for temporary suspensions |
| `deleted_at` | `timestamptz`| `NULLABLE` | Timestamp for soft-deleted accounts (`NULL` if active) |
| `city_id` | `uuid` | `REFERENCES public.cities(id)` | Current operating city |
| `is_profile_completed`| `boolean`| `DEFAULT false` | Onboarding completion flag |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `timestamptz`| `DEFAULT NOW()` | Record update timestamp |

---

### `public.requests`
Represents sports activity posts, game sessions, or carpool requirements published by users or administrators.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique post identifier |
| `user_id` | `uuid` | `REFERENCES public.profiles(id)` | Post creator / organizer |
| `category_id` | `uuid` | `REFERENCES public.categories(id)` | Associated activity category |
| `city_id` | `uuid` | `REFERENCES public.cities(id)` | Host city location |
| `title` | `text` | `NOT NULL` | Post headline / activity title |
| `description` | `text` | `NULLABLE` | Detailed description or match rules |
| `location_name`| `text` | `NOT NULL` | Venue / court name or address |
| `event_date_time`| `timestamptz`| `NULLABLE` | Scheduled event timestamp |
| `max_participants`| `integer`| `DEFAULT 2` | Maximum participant capacity |
| `current_participants`| `integer`| `DEFAULT 0` | Confirmed attendee count |
| `cost_per_person`| `numeric`| `DEFAULT 0` | Share of turf/court fee per player |
| `currency` | `text` | `DEFAULT 'INR'` | Currency code |
| `status` | `text` | `DEFAULT 'open'` | Lifecycle: `'open'`, `'completed'`, `'cancelled'` |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Post creation timestamp |
| `updated_at` | `timestamptz`| `DEFAULT NOW()` | Post update timestamp |

---

### `public.join_requests`
Applications submitted by users wishing to participate in an activity post.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Application identifier |
| `request_id` | `uuid` | `REFERENCES public.requests(id) ON DELETE CASCADE` | Target activity post |
| `user_id` | `uuid` | `REFERENCES public.profiles(id) ON DELETE CASCADE` | Applicant user |
| `status` | `text` | `DEFAULT 'pending'` | Status: `'pending'`, `'accepted'`, `'rejected'`, `'cancelled'` |
| `note` | `text` | `NULLABLE` | Optional message from applicant |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Submission timestamp |

---

### `public.categories`
Master taxonomy of sports and activities available in the platform.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Category identifier |
| `name` | `text` | `NOT NULL` | Display name (e.g. Cricket, Football) |
| `slug` | `text` | `UNIQUE, NOT NULL` | URL / identifier slug (e.g. `cricket`) |
| `icon` | `text` | `DEFAULT '🎯'` | Emoji or icon token |
| `description` | `text` | `NULLABLE` | Short explanation |
| `display_order`| `integer`| `DEFAULT 1` | Sort priority in mobile lists |
| `is_active` | `boolean`| `DEFAULT true` | Feed availability toggle |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `timestamptz`| `DEFAULT NOW()` | Update timestamp |

---

### `public.cities`
Geographical coverage areas supported by KhelBhai.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | City identifier |
| `name` | `text` | `NOT NULL` | City name (e.g. Ahmedabad, Mumbai) |
| `state` | `text` | `NULLABLE` | State / Province |
| `is_active` | `boolean`| `DEFAULT true` | If false, hidden from mobile city picker |
| `display_order`| `integer`| `DEFAULT 999` | Display sorting order |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `timestamptz`| `DEFAULT NOW()` | Update timestamp |

---

### `public.user_devices`
Physical hardware device registry and push notification delivery endpoints.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Record identifier |
| `user_id` | `uuid` | `REFERENCES public.profiles(id) ON DELETE CASCADE` | Account owner |
| `platform` | `text` | `NOT NULL` | `'android'`, `'ios'`, `'web'` |
| `device_model`| `text` | `NULLABLE` | Hardware model string (e.g. `Pixel 8 Pro`) |
| `os_version` | `text` | `NULLABLE` | Operating system version |
| `app_version`| `text` | `NULLABLE` | Installed client app version (e.g. `1.0.3`) |
| `build_number`| `text` | `NULLABLE` | Internal build sequence |
| `device_identifier`| `text`| `NULLABLE` | Hardware UUID or vendor ID |
| `fcm_token` | `text` | `NULLABLE` | Firebase Cloud Messaging push token |
| `is_active` | `boolean`| `DEFAULT true` | Active session heartbeat flag |
| `last_active_at`| `timestamptz`| `DEFAULT NOW()` | Most recent ping / sync |
| `logged_out_at`| `timestamptz`| `NULLABLE` | Session sign-out timestamp |
| `last_token_synced_at`| `timestamptz`| `NULLABLE` | Token refresh timestamp |

---

### `public.reports`
User-filed reports regarding fraudulent posts, inappropriate content, or harassment.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Report identifier |
| `reporter_id`| `uuid` | `REFERENCES public.profiles(id)` | Reporting user |
| `reported_type`| `text`| `NOT NULL` | Target type: `'user'`, `'request'`, `'chat'` |
| `reported_id`| `uuid` | `NOT NULL` | Target entity identifier |
| `reason` | `text` | `NOT NULL` | Report category (e.g. Spam, Abuse) |
| `description`| `text` | `NULLABLE` | Detailed narrative from reporter |
| `status` | `text` | `DEFAULT 'pending'` | Status: `'pending'`, `'resolved'`, `'dismissed'` |
| `resolution_notes`| `text`| `NULLABLE` | Action notes written by reviewing admin |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Filing timestamp |
| `updated_at` | `timestamptz`| `DEFAULT NOW()` | Resolution timestamp |

---

### `public.notifications`
Broadcast notifications dispatched by administrators.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Notification identifier |
| `title` | `text` | `NOT NULL` | Broadcast header |
| `message` | `text` | `NOT NULL` | Notification body |
| `target_audience`| `text`| `DEFAULT 'all'` | Target: `'all'`, `'category'`, `'location'` |
| `status` | `text` | `DEFAULT 'sent'` | `'sent'`, `'scheduled'`, `'cancelled'` |
| `scheduled_at`| `timestamptz`| `NULLABLE` | Future delivery timestamp |
| `sent_count` | `integer`| `DEFAULT 0` | Total delivered recipients |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Record creation timestamp |

---

### `public.app_settings`
Remote runtime configuration key-value pairs consumed by the Flutter application.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `key` | `text` | `PRIMARY KEY` | Configuration key (e.g. `feature_flags`, `maintenance_mode`, `version_control`) |
| `value` | `jsonb`| `NOT NULL` | JSON configuration payload |
| `updated_at` | `timestamptz`| `DEFAULT NOW()` | Last modified timestamp |

---

### `public.user_roles`
RBAC staff role definitions.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Assignment identifier |
| `user_id` | `uuid` | `REFERENCES public.profiles(id) ON DELETE CASCADE` | Staff member identifier |
| `role` | `text` | `NOT NULL` | Staff role: `'super_admin'`, `'admin'`, `'moderator'` |
| `created_at` | `timestamptz`| `DEFAULT NOW()` | Date assigned |

---

## 2. Stored PostgreSQL RPC Functions

1. **`search_users_by_email(search_term text)`**
   - Returns matched users with partial email matching, bypassing client PostgREST email indexing limitations.
2. **`set_user_role(user_id uuid, role text)`**
   - Grants administrator or moderator privileges to a user account.
3. **`revoke_user_role(user_id uuid, role text)`**
   - Revokes staff privileges from a user account.
4. **`get_user_devices_for_admin(target_user_id uuid)`**
   - Security-definer procedure returning sanitized device records for a target user ID, ensuring admin inspection without exposing raw FCM security tokens.

---

## 3. Supabase Edge Functions

1. **`create-admin-user`**
   - Location: `supabase/functions/create-admin-user/index.ts`
   - Purpose: Securely provisions a new user in `auth.users` using the private `SUPABASE_SERVICE_ROLE_KEY` and assigns the requested staff role in `public.user_roles`.
2. **`get-user-devices`**
   - Location: `supabase/functions/get-user-devices/index.ts`
   - Purpose: Fetches user device hardware records with summary metrics while stripping private push tokens before returning to the frontend.
