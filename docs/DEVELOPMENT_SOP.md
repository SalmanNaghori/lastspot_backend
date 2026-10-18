# KhelBhai Admin Panel — Standard Operating Procedures (SOP)

This document establishes the Standard Operating Procedures (SOP) for engineering, maintaining, testing, and deploying the KhelBhai Admin Panel.

---

## 1. Branching & Git Workflow

### Branch Naming Conventions
- Feature branches: `feature/<feature-name>` (e.g. `feature/khelbhai-admin-rebrand`)
- Bug fixes: `fix/<issue-description>`
- Documentation: `docs/<topic>`
- Releases: `release/v<version>`

### Code Rules
1. **Never commit directly to `main` or `develop`**.
2. **Never force-push (`git push --force`)** or rewrite public commit history.
3. Keep commits atomic, focused, and descriptively titled using Conventional Commits:
   - `feat: add activity category drag ordering`
   - `fix: resolve session cleanup on admin logout`
   - `docs: update database schema documentation`

---

## 2. Local Development Environment

### Prerequisites
- **Node.js**: Version 20 LTS or higher (`node -v`)
- **Package Manager**: npm 10+ (`npm -v`)
- **Git**: 2.40+

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd lastspot_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

---

## 3. Pre-Commit Verification Checklist

Before pushing any branch or requesting review, execute the full verification sequence:

1. **Static Analysis & Lint Check**:
   ```bash
   npm run lint
   ```
   *Requirement: 0 errors.*

2. **TypeScript & Production Build Verification**:
   ```bash
   npm run build
   ```
   *Requirement: `tsc -b` and `vite build` must exit with code 0.*

3. **Check Working Tree**:
   ```bash
   git status
   ```
   *Ensure no untracked scratch files, `.env` files, or temporary scripts are staged.*

---

## 4. UI/UX & Quality Guidelines
1. **Consistency**: Always use design tokens and utility classes outlined in `docs/UI_UX_GUIDELINES.md`.
2. **Dark Theme**: Preserve the `#0B1121` canvas and `#111827` surface backgrounds. Never introduce stark white card backgrounds.
3. **Strings**: All user-visible text (titles, labels, buttons, dialog messages) must be defined in `src/core/constants/app_strings.ts`. Never hardcode raw strings in JSX.
4. **Data Access**: All Supabase PostgREST queries must be added to `src/lib/adminRepo.ts`. Do not write ad-hoc PostgREST queries inside components.
5. **Defensive Programming**:
   - Always verify null/undefined states for user names, emails, and avatars.
   - Always supply fallback avatar representations (`user?.full_name?.[0] || '?'`).

---

## 5. Security & Secrets Management
1. **Never expose the Supabase `service_role` key** in frontend code, client bundles, or repository commits.
2. The Admin Panel only receives the public `VITE_SUPABASE_ANON_KEY`.
3. Operations requiring service-role privileges (such as provisioning an admin user in `auth.users`) must be executed via serverless Supabase Edge Functions (`supabase/functions/create-admin-user`).
4. Ensure `.env`, `.env.local`, and `.env.*.local` remain strictly listed in `.gitignore`.

---

## 6. Deployment Procedure

### Automated Deployment (GitHub Pages)
1. Pushing to branch `main` automatically triggers `.github/workflows/deploy.yml`.
2. The workflow executes `npm ci`, verifies `npm run build`, creates a SPA 404 fallback (`cp dist/index.html dist/404.html`), and publishes artifacts to GitHub Pages.
3. GitHub Secrets required:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
