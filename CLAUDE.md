# MyLogMate Web

## Project
Work-logging + AI-recall frontend. React SPA. Minimalistic UI, NotebookLM card style, calm blue accent.

## Stack
React 18 | TypeScript | Vite | Tailwind CSS | React Router v6 | Zustand | Axios | lucide-react | Recharts (admin only) | Vitest + React Testing Library

## Commands
```
npm install        # Install deps
npm run dev        # Vite dev server
npm run build      # Production build
npm run test       # Vitest
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # tsc --noEmit
```

## Architecture
- src/components/ → reusable UI (Button, Card, Input, Modal, Sidebar, etc.)
- src/pages/ → route-level page components (default exports for lazy loading)
- src/hooks/ → custom hooks (useAuth, useApi, useVoiceInput)
- src/store/ → Zustand stores (authStore, logStore, recallStore)
- src/api/ → Axios client + endpoint functions by domain
- src/types/ → TypeScript interfaces
- src/utils/ → utility functions
- src/layouts/ → AppLayout (sidebar), AuthLayout (no sidebar)

## Conventions
- Strict TypeScript. No `any`. Explicit return types. Interfaces for props.
- Named exports for components. Default exports for pages (lazy loading).
- One component per file. Filename = export name.
- PascalCase: components/files. camelCase: hooks/utils/stores.
- Tailwind ONLY. No CSS files. No inline styles. No styled-components.
- Design tokens in tailwind.config.ts. Never hardcode color hex values.
- All interactive elements: default, hover, active, focus, disabled states.
- Every data page: loading skeleton + empty state + error state.
- Icons: lucide-react only. SVG. Consistent stroke width.
- Responsive: mobile-first. sm:/md:/lg: breakpoints.
- API calls in stores or api/ functions, never in components directly.
- Conventional Commits. Separate commits per logical change.

## Design System
- Light: white bg, near-black text, soft blue accent (~#93B5FF)
- Dark: layered bgs (#0F0F0F→#171717→#1F1F1F→#262626), accent #6B9FFF
- Cards: very rounded (rounded-2xl/3xl), soft shadows light, subtle borders dark
- NotebookLM-style: pastel-ish, generous padding, floating feel
- Generous whitespace everywhere

## MCP
- Use context7 for current React, Tailwind, React Router, Zustand, Recharts docs

## Forbidden
- NEVER use `any` type
- NEVER hardcode API URLs or secrets (use VITE_ env vars)
- NEVER skip loading/error/empty states
- NEVER use non-lucide icons
- NEVER add CSS files
- NEVER commit console.log statements
- NEVER use localStorage for access tokens (Zustand memory only)
