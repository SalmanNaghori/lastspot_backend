---
description: "UI Animation and Transition Specification for ActivityConnect Admin Panel"
globs: "**/*.tsx"
alwaysApply: true
---

# ActivityConnect Admin Panel — UI Animation & Transition Specification

This document provides a breakdown of all visual motion physics, CSS animations, and transition effects built into the Admin Panel interface.

## 1. Overview of Motion Design Architecture

The motion system is built around three core principles:
- **Feedback & Confirmation**: Expressive physics (scale, bounce, fade) for destructive or sensitive administrative operations (Soft Delete, Ban, Suspend).
- **Contextual Flow**: Smooth view switching (opacity & fade-in) when moving between pages or deep inspection details (`/users/:id`, `/requests/:id`).
- **Non-Intrusive Guidance**: Subtle status indicators, hover highlights, and loading spinners.

## 2. Animation Breakdown by UI Component

### A. Action Modal & Alert Dialog (`AlertDialog`)
Used for Soft Delete, Reactivation, Account Suspension, and Permanent Ban triggers.
- **Backdrop Layer**:
  - Effect: Soft dark veil fade-in with heavy background blur.
  - Classes: `fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in`
- **Modal Dialog Box**:
  - Effect: Slight scale-up entrance starting at 95% scale paired with an opacity fade.
  - Classes: `transform transition-all duration-300 animate-in zoom-in-95 fade-in`
- **Icon Badge**:
  - Effect: Color-coded pulse/glow depending on action variant (danger = Rose, warning = Amber, success = Emerald, info = Cyan).

### B. Toast Notification System
Used whenever an admin executes state changes (e.g., Soft-deleting a user, saving a category, resolving a report).
- Positioning: Fixed bottom-right corner (`fixed bottom-5 right-5 z-50`).
- Entrance Physics: Subtle initial bounce with smooth fade.
- Classes: `transition-all animate-bounce shadow-2xl backdrop-blur-md`
- Color Schemes:
  - Success: `bg-emerald-950/90 text-emerald-200 border-emerald-800/80`
  - Error/Danger: `bg-rose-950/90 text-rose-200 border-rose-800/80`
  - Info: `bg-slate-900/90 text-slate-100 border-slate-700/80`

### C. Page & View Transitions
Triggered when switching sidebar tabs (e.g., Dashboard -> Users) or navigating to item details (Inspect User or Inspect Request).
- Effect: Subtle 300ms fade-in transition preventing abrupt UI popping.
- Classes: `animate-in fade-in duration-300`

### D. Table Row & Card Hover States
Interactive feedback across data tables (`/users`, `/requests`, `/join-requests`, `/reports`) and category cards.
- Hover Highlights: Subtle background shift to `bg-slate-800/30` or `bg-slate-800/40`.
- Classes: `transition-colors duration-150 ease-in-out`
- Action Buttons: Smooth background transitions on secondary/tertiary buttons:
  - `transition-all hover:bg-slate-700 hover:text-slate-100`

### E. Micro-Interactions & Loading States
- Spinner Rotation: Infinite 360° smooth spin for async fetch/action submit operations.
  - Classes: `animate-spin text-emerald-400`
- Active Navigation Pills: Smooth highlight background transition when toggling sidebar links or tab filters (all, active, suspended, deleted).
  - Classes: `transition-all duration-200`

## 3. Tailwind CSS & Config Rules
Ensure `tailwind.config.js` or CSS imports include the `tailwindcss-animate` plugin and the following keyframe definitions:

```javascript
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "zoom-in-95": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "zoom-in-95": "zoom-in-95 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

## 4. Summary Matrix

| UI Element | Trigger Event | Primary Animation Class | Duration / Easing |
| :--- | :--- | :--- | :--- |
| Alert Dialog Backdrop | Open Modal | `bg-black/80 backdrop-blur-md animate-in fade-in` | 300ms ease-out |
| Alert Dialog Box | Open Modal | `animate-in zoom-in-95` | 300ms cubic-bezier |
| Toast Alerts | Action Complete | `animate-bounce transition-all` | Physics-driven |
| Page Load / Tab Switch | Navigation | `animate-in fade-in` | 300ms ease-out |
| Button / Table Row | Mouse Hover | `transition-colors duration-150` | 150ms ease-in-out |
| Async Loading Spinners | API Loading | `animate-spin` | Linear Infinite |
