# MyLogMate — Design System Reference

**For use by Claude Code / Cursor when building frontend components and pages.**

---

## 1. Design Philosophy

- **NotebookLM-inspired:** Pastel-ish, generous padding, floating cards, soft shadows (light) / subtle borders (dark)
- **Google-card style:** Very rounded corners, clean borders, generous whitespace
- **Calm and professional:** Not flashy. Soft blue accent against black/white base.
- **Desktop-first responsive:** Primary use is desktop. Must work on mobile (375px+).
- **Real product feel:** Every label, button, and message reads polished and human.

---

## 2. Color System

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| Page background | `white` (#FFFFFF) | Main bg |
| Card background | `white` (#FFFFFF) | Cards, panels |
| Card hover | `gray-50` (#F9FAFB) | Hover state on cards |
| Sidebar background | `gray-50` (#F9FAFB) | Left sidebar |
| Input background | `white` (#FFFFFF) | Form inputs |
| Primary text | `gray-900` (#1A1A1A) | Headings, body |
| Secondary text | `gray-500` (#6B7280) | Labels, captions, timestamps |
| Placeholder text | `gray-400` (#9CA3AF) | Input placeholders |
| Borders | `gray-200` (#E5E7EB) | Card borders, dividers |
| Accent | `#93B5FF` | Primary buttons, active states, links |
| Accent hover | `#A8C4FF` | Button hover |
| Accent muted | `rgba(147,181,255,0.12)` | Accent backgrounds (tags, badges) |
| Success | `#22C55E` | Positive indicators |
| Error | `#EF4444` | Error messages, destructive actions |
| Warning | `#F59E0B` | Warnings |

### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| Page background | `#0F0F0F` | Main bg |
| Surface 1 | `#171717` | Sidebar, elevated panels |
| Surface 2 | `#1F1F1F` | Cards, modals |
| Surface 3 | `#262626` | Card hover, active states |
| Surface 4 | `#1A1A1A` | Input backgrounds |
| Primary text | `#F5F5F5` | Headings, body |
| Secondary text | `#A3A3A3` | Labels, captions |
| Placeholder text | `#737373` | Input placeholders |
| Borders | `#2A2A2A` | All borders (replace shadows in dark) |
| Accent | `#6B9FFF` | Primary buttons, links |
| Accent hover | `#85B0FF` | Button hover |
| Accent muted | `rgba(107,159,255,0.12)` | Accent backgrounds |
| Success | `#4ADE80` | |
| Error | `#F87171` | |
| Warning | `#FBBF24` | |

### Dark Mode Key Rule

In dark mode, **borders replace shadows** for elevation. Cards don't have shadow-md — they have `border border-[#2A2A2A]`. Depth comes from layered background colors (0F → 17 → 1F → 26).

---

## 3. tailwind.config.ts Tokens

```ts
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#93B5FF",
          hover: "#A8C4FF",
          muted: "rgba(147,181,255,0.12)",
        },
        "dark-accent": {
          DEFAULT: "#6B9FFF",
          hover: "#85B0FF",
          muted: "rgba(107,159,255,0.12)",
        },
        surface: {
          1: "#171717",
          2: "#1F1F1F",
          3: "#262626",
          4: "#1A1A1A",
        },
      },
      borderRadius: {
        card: "1rem",
        "card-lg": "1.25rem",
      },
    },
  },
};
```

**Rule:** Never hardcode hex values in components. Always use design tokens.

---

## 4. Component Patterns

### Cards

```
bg-white dark:bg-surface-2
rounded-card-lg
border border-gray-200 dark:border-[#2A2A2A]
p-5
hover:shadow-md dark:hover:bg-surface-3
transition-all duration-200
```

### Buttons

**Primary:** Pill shape. Accent bg, white text.
```
bg-accent dark:bg-dark-accent
text-white
rounded-full
px-6 py-2.5
hover:bg-accent-hover dark:hover:bg-dark-accent-hover
transition-colors duration-200
disabled:opacity-50 disabled:cursor-not-allowed
```

**Secondary:** Ghost/outlined.
```
bg-transparent
border border-gray-200 dark:border-[#2A2A2A]
text-gray-700 dark:text-gray-300
rounded-xl
px-4 py-2
hover:bg-gray-50 dark:hover:bg-surface-3
```

**Destructive:** Red variant for delete actions.
```
bg-red-500 dark:bg-red-600
text-white
rounded-full
hover:bg-red-600 dark:hover:bg-red-700
```

### Inputs

```
bg-white dark:bg-surface-4
border border-gray-200 dark:border-[#2A2A2A]
rounded-xl
px-4 py-2.5
text-gray-900 dark:text-[#F5F5F5]
placeholder-gray-400 dark:placeholder-[#737373]
focus:ring-2 focus:ring-accent/20 dark:focus:ring-dark-accent/20
focus:border-accent dark:focus:border-dark-accent
transition-all duration-200
```

### Sidebar

- Desktop: fixed left rail, 256px width (w-64)
- Minimized: icons only, 64px (w-16), VS Code-style toggle
- Mobile (<768px): hidden, hamburger menu, slide-over panel
- Background: gray-50 (light) / surface-1 (dark)
- Active item: accent muted bg + accent text
- Hover: gray-100 (light) / surface-3 (dark)

**Sidebar menu order:**
1. Home
2. Log
3. Recall
4. Teammates
5. Projects
6. Tags
7. Templates
8. Chat History
9. Feedback
10. Settings

### Modals

```
bg-white dark:bg-surface-2
rounded-2xl
border border-gray-200 dark:border-[#2A2A2A]
shadow-xl dark:shadow-none
p-6
```
Backdrop: `bg-black/50 dark:bg-black/70`

### Tags/Badges

```
bg-accent/10 dark:bg-dark-accent/10
text-accent dark:text-dark-accent
rounded-full
px-3 py-1
text-sm
```

### Loading Skeletons

Light: shimmer between `gray-200` and `gray-100`
Dark: shimmer between `surface-2` and `surface-3`
Use `animate-pulse` with rounded shapes matching content.

### Empty States

Centered icon (lucide-react, 48px, gray-400) + message text (gray-500) + optional action button.

---

## 5. Typography

- **Font:** System sans-serif stack (`font-sans` in Tailwind — Inter/SF Pro/Segoe UI)
- **Headings:** `text-2xl font-semibold` (page titles), `text-xl font-semibold` (section titles), `text-lg font-medium` (card titles)
- **Body:** `text-base` (16px)
- **Small:** `text-sm` (14px) for labels, captions, timestamps
- **Tiny:** `text-xs` (12px) for badges, meta info

---

## 6. Spacing

- Card padding: `p-5` or `p-6`
- Section gaps: `gap-4` or `gap-6`
- Page padding: `px-4 py-8` (mobile), `px-6 py-8` (desktop)
- Content max width: `max-w-4xl mx-auto`
- Stack spacing: `space-y-4` or `space-y-6`
- Generous everywhere. When in doubt, add more space.

---

## 7. Icons

- **Library:** lucide-react ONLY. No other icon libraries.
- **Size:** 20px default (`w-5 h-5`), 16px small, 24px large
- **Stroke:** Default stroke width (consistent across all icons)
- **Color:** Inherit from text color

---

## 8. Transitions

- Duration: `duration-200` for hover/state changes
- Easing: default (ease)
- Apply to: background color, border color, shadow, opacity, transform

---

## 9. Screen List (All Pages)

### Public (No Auth)
1. **Landing Page** — Navbar, hero (tagline + CTA + demo video), what is, how it works (3 steps), who it's for, why you'll love it, final CTA, footer
2. **Login** — Username + password form, Google OAuth button, link to signup/forgot password
3. **Signup** — Username + email + password form, Google OAuth button, link to login
4. **Forgot Password** — Email input, submit button
5. **Reset Password** — New password + confirm, submit button

### Protected (Auth Required)
6. **Home/Dashboard** — Context selector (3 cards: Self, Teammate, Project), quick-add log, recent entries
7. **Log** — Context selected → date picker (daily/weekly/custom) → text input + voice + template picker + tags → submit
8. **Recall** — Year cards → month cards → calendar view + logs on right. Sticky AI prompt bar at bottom (minimizable).
9. **Teammates** — List of teammate contexts. Create new. Click to see logs.
10. **Projects** — List of project contexts. Create new. Click to see logs.
11. **Tags** — List of user's tags. Create, rename.
12. **Templates** — Custom templates (CRUD) + sample templates (read-only). 6 role-based samples.
13. **Chat History** — List of past AI conversations. Click to view full chat.
14. **Feedback** — Simple text area + submit. In sidebar.
15. **Settings** — Dark mode toggle, account info, change password.

### Admin (Hidden, is_admin only)
16. **Admin Dashboard** — Date range filter, metric cards, charts (Recharts), users table, feedback list, health indicators.

---

## 10. Responsive Breakpoints

| Breakpoint | Width | Notes |
|------------|-------|-------|
| Mobile | <640px | Default (no prefix). Single column. No sidebar. |
| Tablet | sm: 640px+ | Minor adjustments. |
| Desktop | md: 768px+ | Sidebar visible. Two-column layouts. |
| Large | lg: 1024px+ | Full layouts. Calendar + logs side by side. |
| XL | xl: 1280px+ | Max content width. |

### Key Responsive Patterns

- **Sidebar:** Hidden on mobile, hamburger toggle. Visible md+.
- **Calendar + Logs:** Stacked on mobile, side-by-side lg+.
- **Cards grid:** 1 col mobile, 2 col md, 3 col lg.
- **Forms:** Full width on mobile, constrained max-w-md on desktop.
- **Touch targets:** Minimum 44px height on mobile.

---

## 11. Special Components

### AI Prompt Bar (Recall Screen)

- Fixed at bottom, full width minus sidebar
- Contains: filter toggle (SlidersHorizontal icon), text input, mic icon (voice), send button (ArrowUp icon)
- Minimizable to floating circle icon (bottom-right)
- Filter panel: expandable dropdown with time range + tag chips

### Chat Overlay (AI Response)

- Expands from bottom as overlay (95% opacity bg)
- User messages: right-aligned, accent/10 bg
- AI messages: left-aligned, gray-50 / surface-2 bg
- X button to close, return to calendar view
- Input bar stays at bottom for follow-ups

### Calendar Grid

- 7 columns (Mon-Sun), 5-6 rows
- Days with logs: accent/15 bg fill
- Selected day: accent bg, white text
- Multi-day entries: continuous fill across range
- Today: subtle ring indicator
- Outside-month days: opacity-30
- Click date → slides calendar left, shows logs on right

### Google OAuth Button

- Stays light-themed even in dark mode (brand guidelines)
- White bg, dark text, Google "G" logo
- Standard Google sign-in button styling

---

## 12. Animation & Loading

### AI Loading (typing indicator)
Three pulsing dots, accent colored, staggered bounce animation.

### Page Transitions
Lazy-loaded pages with Suspense fallback (full-screen skeleton).

### Skeleton Loading
Every data page shows skeleton placeholders while loading. Match the shape of real content.

### Toast Notifications
Bottom-right corner. Auto-dismiss after 3 seconds. Success (green), error (red), info (accent).

---

## 13. Dark Mode Implementation

### Toggle
- Stored in localStorage + Zustand
- Applied via `class` strategy on `<html>` element
- Toggle in Settings page + optional header icon

### Build Order
**Build light mode first for all screens. Add dark mode after.**

Dark mode design prompt is saved separately (MyLogMate_Dark_Mode_Design_Prompt.md) for when ready.
