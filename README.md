# KhelBhai Admin Panel — Control Center

The **KhelBhai Admin Panel** is a modern, responsive web application designed for comprehensive platform supervision, user management, activity moderation, and remote system configuration for **KhelBhai** (formerly *LastSpot*).

Built with **React 19, TypeScript, Vite 8, and Tailwind CSS**, it interfaces directly with a **Supabase (PostgreSQL)** backend and coordinates seamlessly with the **KhelBhai Mobile App (Flutter)**.

---

## 🚀 Technology Stack

- **Frontend Framework:** React 19 (Concurrent Mode, React 19 Compiler compatible)
- **Bundler & Dev Server:** Vite 8
- **Language:** TypeScript (~6.0)
- **Styling:** Tailwind CSS 3 with `tailwindcss-animate`
- **UI Primitives:** Radix UI accessible primitives
- **Icons:** Lucide React
- **Routing:** React Router v7 with dynamic `React.lazy()` code splitting
- **Backend / Database:** Supabase (PostgreSQL 15+, Supabase Auth, Storage, Edge Functions)

---

## ✨ Key Features

- **🛡️ Secure Two-Tier Auth & RBAC:** Multi-role authorization (`super_admin`, `admin`, `moderator`) with fine-grained route guards and automatic unprivileged session rejection.
- **📊 KhelBhai Control Center:** Real-time platform metrics across 10 core analytics dimensions, live registration stream, activity post stream, and device telemetry.
- **👥 User Directory & Profile Inspection:** Search users by name or email (via RPC), filter by status/city, activate, suspend, ban, or soft-delete accounts.
- **🎯 Sports Activity & Join Management:** Review published sports posts, approve/deny join applications, inspect participant requirements.
- **🏷️ Category & City Coverage:** Organize sports taxonomies with emoji tokens, drag-order priority, and toggle city geographical availability.
- **🚨 Content Moderation Queue:** Review user complaints regarding fake posts or harassment, take administrative action, and record resolution notes.
- **📱 Device Inventory & Telemetry:** Inspect hardware models, platform breakdowns (Android, iOS, Web), OS versions, installed app builds, and last active heartbeats.
- **📢 Broadcast Notifications Hub:** Compose and dispatch instant or scheduled push and in-app broadcasts to segmented audiences.
- **⚙️ Remote Config & Version Enforcement:** Configure maintenance mode, feature flags (chat, sports scheduling, carpooling), and enforce minimum app versions with custom update prompts.

---

## 📁 Repository Architecture & Persistent Docs

Comprehensive documentation is maintained in [`docs/`](file:///o:/Project/lastspot_backend-1/docs):

- **[PROJECT_CONTEXT.md](file:///o:/Project/lastspot_backend-1/docs/PROJECT_CONTEXT.md)**: Platform background, stack, and implementation status.
- **[ARCHITECTURE.md](file:///o:/Project/lastspot_backend-1/docs/ARCHITECTURE.md)**: Mermaid architectural diagrams, module graphs, and data flows.
- **[ADMIN_MODULES.md](file:///o:/Project/lastspot_backend-1/docs/ADMIN_MODULES.md)**: Detailed functional specifications for all 11 admin modules.
- **[DATABASE_SCHEMA.md](file:///o:/Project/lastspot_backend-1/docs/DATABASE_SCHEMA.md)**: Supabase PostgreSQL tables, RPCs, and Edge Functions.
- **[UI_UX_GUIDELINES.md](file:///o:/Project/lastspot_backend-1/docs/UI_UX_GUIDELINES.md)**: Design system, color tokens, typography, and motion guidelines.
- **[CODE_REVIEW.md](file:///o:/Project/lastspot_backend-1/docs/CODE_REVIEW.md)**: In-depth code review categorized by Critical, High, Medium, and Low.
- **[CHANGELOG.md](file:///o:/Project/lastspot_backend-1/docs/CHANGELOG.md)**: Complete chronological history of updates.
- **[DECISIONS.md](file:///o:/Project/lastspot_backend-1/docs/DECISIONS.md)**: Architectural Decision Records (ADRs).
- **[DEVELOPMENT_SOP.md](file:///o:/Project/lastspot_backend-1/docs/DEVELOPMENT_SOP.md)**: Standard Operating Procedures, git workflow, and verification checklists.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v20+)
- npm (v10+)

### Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lastspot_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Execute Verification Checklist:**
   ```bash
   npm run lint   # Static analysis (must pass with 0 errors)
   npm run build  # Production build verification
   ```

---

## 🔒 Security & Data Integrity

- The Admin Panel exclusively uses the public `VITE_SUPABASE_ANON_KEY` client.
- Sensitive administrative mutations (e.g. creating staff credentials in `auth.users`) are handled securely via backend Deno Edge Functions using the server-side Service Role key.
- All database operations respect Supabase Row Level Security (RLS) policies.