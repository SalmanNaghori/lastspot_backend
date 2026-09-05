# LastSpot Admin Panel

The LastSpot Admin Panel is a modern, responsive web application designed for comprehensive platform management. Built with React, TypeScript, and Vite, it interfaces directly with a Supabase backend to manage users, devices, activity categories, and system notifications.

## 🚀 Technologies

*   **Frontend Framework:** React 18, Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (with Lucide React icons)
*   **Backend / Database:** Supabase (PostgreSQL, Authentication)
*   **Routing:** React Router v6
*   **Charts:** Recharts

## ✨ Key Features

*   **Secure Authentication:** Protected routes requiring admin-level access via Supabase Auth and JWTs.
*   **Dashboard & Analytics:** High-level overview of users, active devices, and pending requests with dynamic charts.
*   **User Management:** View registered users, manage bans, check active statuses, and view detailed user profiles.
*   **Device Tracking:** Monitor connected devices (iOS, Android, Web) and app versions.
*   **Category Management:** Create, edit, and organize activity categories (e.g., Sports, Travel, Tech) with display ordering.
*   **Requests & Join Requests:** Approve or deny user-submitted spots or group-join requests.
*   **Content Moderation:** Review, resolve, or dismiss user reports regarding fake posts or harassment.
*   **Notifications System:** Dispatch immediate or scheduled push/in-app notifications to targeted user segments.
*   **Remote Settings:** Toggle app-wide feature flags dynamically (e.g., In-App Chat, Sports Scheduling).

## 📁 Project Architecture

The project follows a clean architectural pattern to separate concerns:

*   **`src/features/`**: Contains module-specific pages and components (Auth, Dashboard, Users, Categories, Devices, Notifications, etc.).
*   **`src/core/constants/app_strings.ts`**: A centralized repository for all static UI text, ensuring maintainability and ease of localization.
*   **`src/lib/adminRepo.ts`**: The Data Access Layer. All Supabase queries and API interactions are encapsulated here using the Repository pattern.
*   **`src/app/router/`**: Defines application routing and protected route wrappers.
*   **`src/components/common/`**: Reusable layout components like `AdminLayout`, `Sidebar`, and `Header`.

## 🛠️ Local Development

### Prerequisites

*   Node.js (v18+)
*   npm or yarn

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd lastspot_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=https://your-project-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will typically start on `http://localhost:5173/` (or `5174` if the port is in use).

## 🔒 Security & Row Level Security (RLS)

The frontend uses the Supabase `anon_key` client, meaning all data access respects Supabase's Row Level Security (RLS) policies. To properly view all data in the admin panel, the authenticated user must be assigned the `admin` role in the `user_roles` table, and the respective tables must have policies allowing admins to perform `SELECT`/`UPDATE`/`DELETE` operations.

*Example RLS Policy for Admins:*
```sql
create policy "Admins can view all records"
on public.your_table
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);
```