# KhelBhai Admin Panel — UI/UX Design System & Guidelines

This document outlines the visual design system, interaction patterns, component guidelines, motion specifications, and accessibility requirements for the KhelBhai Admin Panel.

---

## 1. Design Philosophy
The KhelBhai Admin Panel is engineered around three pillars:
- **High-Density Clarity**: Dense, scannable data layouts enabling rapid operational reviews without visual clutter.
- **Vibrant Dark-Aesthetic**: A deep slate foundation (`#0B1121`) accented with energetic sports emerald gradients (`#10B981` -> `#059669`), cyan telemetry highlights, and color-coded status badges.
- **Intentional Motion & Feedback**: Meaningful micro-animations that confirm destructive actions, soften view transitions, and provide instant visual feedback without latency.

---

## 2. Color Palette & Design Tokens

### Background & Surface Hierarchy
```css
--bg-app:        #0B1121; /* Global canvas background */
--bg-sidebar:    #111827; /* Desktop navigation bar & headers */
--bg-surface:    #151C2C; /* Primary card surfaces & table backgrounds */
--bg-subtle:     #050B14; /* Inset form fields & search bars */
--border-subtle: #1E293B; /* 1px structural dividing lines (slate-800) */
--border-active: #334155; /* Interactive hover borders (slate-700) */
```

### Brand & Status Accents
| Role | Hex | Tailwind Token | Use Case |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | `#10B981` | `emerald-500` | Primary buttons, active navigation pills, brand badges |
| **Brand Glow** | `#059669` | `emerald-600` | Hover states, active gradients |
| **Info / Telemetry**| `#38BDF8` | `sky-400` / `cyan-400` | Platform badges, Web devices, activity post links |
| **Warning / Pending**| `#F59E0B`| `amber-400` / `amber-500` | Suspended users, pending join applications |
| **Danger / Destructive**| `#F43F5E`| `rose-500` / `rose-400` | Banned users, soft-delete actions, error states |
| **Neutral Text High** | `#F8FAFC`| `slate-50` | Primary headlines and active values |
| **Neutral Text Medium**| `#94A3B8`| `slate-400` | Labels, table headers, descriptions |
| **Neutral Text Low** | `#64748B`| `slate-500` | Subtitles, helper text, empty state icons |

---

## 3. Typography
- **Primary Interface Font**: `Plus Jakarta Sans`, `Inter`, system-ui.
- **Telemetry & Monospace**: `JetBrains Mono`, `ui-monospace`.

### Hierarchy
- **Module Headlines**: `text-2xl font-bold tracking-tight text-white`
- **Section Headers**: `text-xs font-bold text-slate-500 uppercase tracking-widest font-mono`
- **Card Metrics**: `text-2xl font-bold text-slate-100`
- **Table Cell Text**: `text-xs font-medium text-slate-300`
- **Form Labels**: `text-sm font-semibold text-slate-200`
- **Status Badges**: `text-[10px] font-bold uppercase tracking-wider`

---

## 4. Component Patterns

### A. Data Tables
- **Container**: `bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl`
- **Header Row**: `bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800`
- **Row Hover**: `hover:bg-slate-800/40 transition-colors duration-150 ease-in-out`
- **Dividers**: `divide-y divide-slate-800/60`
- **Cell Padding**: `px-4 py-3.5` for compact desktop density.

### B. Action Dialogs (`AlertDialog`)
- **Backdrop**: `fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in`
- **Modal Box**: `bg-[#151C2C] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200`
- **Primary Confirm**:
  - Danger (Ban / Delete): `bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl`
  - Success (Reactivate): `bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl`
  - Warning (Suspend): `bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl`

### C. Search & Filter Bar
- Unified inline filter strip: Search input with search icon, category/city dropdown selects, status pill buttons, and a clear filters action.
- Clear query feedback when zero matches are found with an immediate "Reset Filters" button.

### D. Empty & Error States
- Never show a blank screen. Always include:
  - Visual icon token in a rounded slate badge (`w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800`)
  - Clear descriptive title (e.g., "No users found matching filters")
  - Friendly subtext explaining how to resolve or clear filters.
  - Action button (e.g., "Clear Filters", "Add Category", "Retry Load").

---

## 5. Motion & Transitions Specification

| UI Element | Trigger Event | Classes / Physics | Duration |
| :--- | :--- | :--- | :--- |
| **Route Switch** | Page change | `animate-in fade-in` | 300ms ease-out |
| **Modal Open** | Action button | `animate-in zoom-in-95 fade-in` | 200ms cubic-bezier |
| **Table Row** | Pointer hover | `transition-colors` | 150ms ease-in-out |
| **Async Action** | Form submit | `animate-spin` | Infinite linear |
| **Toast Alert** | Dispatch | `shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5` | 300ms |

---

## 6. Accessibility & Responsiveness
- **Keyboard Navigation**: Form inputs, buttons, and card links must specify explicit `:focus-visible` or `focus:ring-2 focus:ring-emerald-500/50 focus:outline-none`.
- **Contrast**: Text elements strictly maintain WCAG 2.1 AA standards (minimum 4.5:1 contrast against `#0B1121` and `#111827`).
- **Responsive Layout**:
  - **Desktop (>= 768px)**: Fixed width 64 (256px) sidebar with categorized navigation groups and collapsible drawer.
  - **Mobile (< 768px)**: Fixed sticky header with brand icon and animated hamburger drawer menu. Full width card stacks and horizontal table scroll wrappers.
