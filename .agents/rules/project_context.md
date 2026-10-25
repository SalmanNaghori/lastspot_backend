---
description: "Master AI Agent Context and Architecture Reference for KhelBhai Admin Panel"
globs: "**/*"
alwaysApply: true
---

# KhelBhai Admin Panel — AI Agent Instructions & Architecture Reference

Welcome to the **KhelBhai Admin Panel** repository (`lastspot_backend`).

Whenever you begin or resume work on this repository, you **MUST** read and adhere to the persistent documentation stored under `docs/`:

1. **[PROJECT_CONTEXT.md](file:///o:/Project/lastspot_backend-1/docs/PROJECT_CONTEXT.md)**: Platform overview, technology stack (React 19, Vite 8, TypeScript 6, Tailwind CSS), and current status.
2. **[ARCHITECTURE.md](file:///o:/Project/lastspot_backend-1/docs/ARCHITECTURE.md)**: Mermaid architectural diagrams, module graphs, authentication pipeline, and Supabase data flows.
3. **[ADMIN_MODULES.md](file:///o:/Project/lastspot_backend-1/docs/ADMIN_MODULES.md)**: Specification of all 11 core modules, routing, RBAC permissions, and views.
4. **[DATABASE_SCHEMA.md](file:///o:/Project/lastspot_backend-1/docs/DATABASE_SCHEMA.md)**: PostgreSQL table schemas, RPC functions, and Supabase Edge Functions.
5. **[UI_UX_GUIDELINES.md](file:///o:/Project/lastspot_backend-1/docs/UI_UX_GUIDELINES.md)**: Design system, KhelBhai V2 brand tokens (Orange `#F46A35`, Amber `#FFB45E`, Light `#FFF8F1`, Dark `#12141B`), typography, and accessibility.
6. **[CODE_REVIEW.md](file:///o:/Project/lastspot_backend-1/docs/CODE_REVIEW.md)**: Code review findings, classified issues, and resolution history.
7. **[CHANGELOG.md](file:///o:/Project/lastspot_backend-1/docs/CHANGELOG.md)**: Chronological record of features, refactors, and fixes.
8. **[DECISIONS.md](file:///o:/Project/lastspot_backend-1/docs/DECISIONS.md)**: Architectural Decision Records (ADRs).
9. **[DEVELOPMENT_SOP.md](file:///o:/Project/lastspot_backend-1/docs/DEVELOPMENT_SOP.md)**: Standard Operating Procedures, git workflow, and pre-commit checks.

## Critical Behavioral Rules for AI Agents
1. **Never Rename Integration Identifiers**: Retain all existing Supabase PostgreSQL table names, columns, RPC function names, storage buckets, and environment variable names for full backward compatibility with the Flutter mobile application.
2. **Centralize UI Strings**: Always add user-visible strings to `src/core/constants/app_strings.ts`. Do not hardcode strings in JSX.
3. **Encapsulate Queries in DAL**: All PostgREST queries, mutations, and RPCs must be routed through `src/lib/adminRepo.ts`.
4. **Run Verification Before Staging**: Always run `npm run lint` and `npm run build` to verify 0 errors before making git commits.
5. **Git Safety**: Never commit directly to `main`. Use descriptive feature branches and atomic commits.
