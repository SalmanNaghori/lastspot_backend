# KhelBhai Admin Panel V2 — UI/UX Design System & Guidelines

This document outlines the visual design system, interaction patterns, component guidelines, motion specifications, and accessibility requirements for the KhelBhai Admin Panel V2.

---

## 1. Design Philosophy
The KhelBhai Admin Panel V2 is aligned with the official KhelBhai mobile application:
- **Sports Energy & Warmth**: Grounded in KhelBhai's signature primary warm orange (`#F46A35`) and amber (`#FFB45E`), representing energy, athleticism, and community.
- **Dual-Theme Seamlessness**: Complete first-class Light (`#FFF8F1`) and Dark (`#12141B`) themes with instantaneous OS sync and user persistence.
- **High-Density Clarity**: Clean, highly readable admin tables, forms, and telemetry cards without clutter.
- **3D Sports Vector Illustrations**: High-fidelity 3D sports iconography and tailored empty states (cricket, football, badminton, tennis) enhancing the user experience.

---

## 2. Official Brand Colors & Design Tokens

### Core Brand Values
| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Orange** | `#F46A35` | Interactive Primary | Primary buttons, active tabs, icon highlights, selection rings |
| **Orange Hover** | `#DC5425` | Primary Hover | Hover & focus states on primary orange elements |
| **Warm Amber** | `#FFB45E` | Secondary Accent | Highlights, secondary gradients, active indicators |
| **Amber Hover** | `#EAA04C` | Secondary Hover | Accent button hover states |

### Light Theme (`[data-theme="light"]`)
| Role | Hex | CSS Token | Description |
| :--- | :--- | :--- | :--- |
| **Background** | `#FFF8F1` | `var(--kb-bg)` | Warm off-white canvas |
| **Surface** | `#FFFFFF` | `var(--kb-surface)` | Clean elevated card and modal surface |
| **Subtle Inset** | `#FDF3E7` | `var(--kb-subtle)` | Form inputs, table striping, inactive states |
| **Border** | `#F0E4DA` | `var(--kb-border)` | Warm subtle structural border |
| **Primary Text** | `#171D2A` | `var(--kb-text)` | High-contrast dark charcoal readable text |
| **Muted Text** | `#697386` | `var(--kb-muted)` | Descriptions, timestamps, secondary labels |

### Dark Theme (`.dark, [data-theme="dark"]`)
| Role | Hex | CSS Token | Description |
| :--- | :--- | :--- | :--- |
| **Background** | `#12141B` | `var(--kb-bg)` | Deep neutral dark canvas |
| **Surface** | `#20232D` | `var(--kb-surface)` | Card, table, and modal surface |
| **Subtle Inset** | `#181B24` | `var(--kb-subtle)` | Form inputs and inset backgrounds |
| **Border** | `#2E3442` | `var(--kb-border)` | Low-contrast dark structural border |
| **Primary Text** | `#FFF8F1` | `var(--kb-text)` | Warm light readable text |
| **Muted Text** | `#9CA3AF` | `var(--kb-muted)` | Secondary text and disabled indicators |

---

## 3. Theme Engine & Persistence

- **Modes**: `light`, `dark`, and `system`.
- **Storage**: Key `'khelbhai_admin_theme'` in `localStorage`.
- **OS Synchronization**: Active listener on `window.matchMedia('(prefers-color-scheme: dark)')`.
- **DOM Application**: Applies `.dark` class and `data-theme="dark"` / `data-theme="light"` to `document.documentElement`.
- **Toggles**: `AdminThemeToggle` provides segmented and icon-only variants for header and sidebar integration.

---

## 4. Typography
- **Primary Font**: `Outfit`, `Inter`, system-ui.
- **Monospace Font**: `JetBrains Mono`, `ui-monospace`.

### Hierarchy
- **Module Headlines**: `text-2xl font-bold tracking-tight text-[var(--kb-text)]`
- **Section Headers**: `text-xs font-bold text-[var(--kb-muted)] uppercase tracking-wider`
- **KPI Metrics**: `text-2xl font-black text-[var(--kb-text)]`
- **Table Cell Text**: `text-xs font-medium text-[var(--kb-text)]`
- **Form Labels**: `text-xs font-semibold text-[var(--kb-text)]`
- **Status Badges**: `text-[10px] font-bold uppercase tracking-wider`

---

## 5. Branded Component Suite (`src/components/brand/`)

1. **`KhelBhaiLogo`**: Official sports shield vector mark with orange-amber gradient and customizable badge.
2. **`SportsIllustration`**: 3D sports vector illustration engine supporting `login_hero` and empty states (`empty_users`, `empty_activities`, `empty_devices`, `empty_notifications`, `empty_reports`, `empty_general`).
3. **`AdminSidebar`**: Collapsible desktop/mobile drawer navigation with brand logo, live connection status, active indicator pill, and user profile card.
4. **`AdminHeader`**: Glassmorphic sticky top navigation bar with mobile toggle and theme switcher.
5. **`AdminPageHeader`**: Unified view header with page title, subtitle, count badge, and action button slots.
6. **`AdminStatCard`**: Elevated metric card featuring brand orange icon container and smooth hover elevation.
7. **`AdminDataTable`**: Responsive table featuring sticky header, pagination, skeleton loading, and empty state fallback.
8. **`AdminSearchBar` & `AdminFilterBar`**: Search input with clear button and scrollable category pills.
9. **`AdminStatusBadge`**: High-contrast, WCAG-compliant status badges for users, devices, requests, and moderation reports.
10. **`AdminFormField`**: Form input container with label, error display, and focus rings.
11. **`AdminModal`**: Glassmorphic modal with escape key and click-outside dismissal.
12. **`AdminEmptyState`**: Illustrated empty state with optional primary call-to-action.
13. **`AdminLoadingSkeleton`**: Shimmer skeletons for tables, KPI cards, and profile specifications.
14. **`AdminErrorState`**: Error banner with diagnostic error messages and retry handler.
15. **`AdminThemeToggle`**: Segmented or icon-only theme mode selector.

---

## 6. Accessibility & Contrast (WCAG 2.1 AA)

- Never place raw `#F46A35` text on pure white `#FFFFFF` when used for small body copy. Use `#DC5425` or high-contrast neutral text `#171D2A` with an orange indicator dot/icon.
- All form inputs provide visible `:focus-visible` orange outline rings (`ring-2 ring-[#F46A35]/30`).
- Destructive actions require secondary confirmation via `AlertDialog`.
- All modals and interactive dropdowns support complete keyboard navigation (`Escape`, `Enter`, `Tab`).
