# CLAUDE.md

## Project Overview
albitir — Turkish surplus food rescue PWA (Too Good To Go clone). React 19 + Vite + TypeScript + Firebase v11 + Tailwind CSS v4. Mobile-first, Turkish locale.

## Build & Dev Commands
- `npm run dev` — start Vite dev server
- `npm run build` — TypeScript check + Vite production build (must pass with zero errors)
- `npm run lint` — ESLint
- `firebase deploy --only hosting` — deploy to https://albitir-app.web.app

## Code Conventions

### TypeScript
- Strict mode enabled, `verbatimModuleSyntax` requires `import type` for type-only imports
- Path alias `@/` maps to `src/` (configured in tsconfig + vite)
- All data models in `src/types/index.ts`

### Styling
- Tailwind CSS v4 with custom `@theme` tokens in `src/index.css`
- Primary color: teal `#0E7C6B` (use `primary-700`, `primary-50`, etc.)
- Danger: `danger-500`, Success: `success-500`, Accent: `accent-400`
- Mobile-first design, use `min-h-dvh` for full-height layouts

### Component Patterns
- UI components in `src/components/ui/` — Button, Badge, TextField, BottomSheet, PageHeader, etc.
- Feature pages in `src/features/{feature}/` — one directory per domain
- Services in `src/services/` — one file per Firebase collection/domain
- Hooks in `src/hooks/` — custom React hooks
- Utils in `src/utils/` — pure utility functions

### File Naming
- React components: PascalCase `.tsx` (e.g., `OrderDetailPage.tsx`)
- Services/utils/hooks: camelCase `.ts` (e.g., `orderService.ts`)
- No barrel exports — import directly from files

### State Management
- React Context for auth state (`AuthContext.tsx`)
- `sessionStorage` for multi-step wizard drafts (`offerDraft.ts`)
- No global state library — local state + prop drilling + context

### Routing
- All routes defined in `src/app/routes.tsx`
- Consumer routes under `/` with `ConsumerLayout` (tab bar)
- Business routes under `/business/` with `BusinessLayout`
- Admin routes under `/admin/` with `AdminLayout` (hidden, no public links)
- Auth guard: `RequireAuth` (checks Firebase user), `RequireAdmin` (checks `admins` collection)

## Key Business Rules
- **No cancellation** — consumers cannot cancel orders. Never add a cancel button.
- **Order state machine:** CREATED → PAID → READY → COMPLETED, PAID/READY → NO_SHOW
- **Commission:** 25% of discounted price (`COMMISSION_RATE = 0.25`)
- **Tax:** 8% KDV (`TAX_RATE = 0.08`)
- **Wallet:** Amounts in kuruş (1 TL = 100 kuruş). `SIGNUP_BONUS_AMOUNT = 10000` (100 TL)
- **Pickup code:** 4-digit numeric. Order number: `ORD-{timestamp % 1000000}`
- **Payment:** Dummy placeholder — `DummyPaymentService` with 800ms delay
- **Business status flow:** PENDING_REVIEW → IN_REVIEW → APPROVED / NEEDS_INFO / REJECTED

## Firebase
- Project: `albitir-app`
- Auth providers: Email/Password + Google Sign-In
- Firestore collections: `users`, `businesses`, `offers`, `orders`, `walletTransactions`, `admins`
- Rules in `firestore.rules`, indexes in `firestore.indexes.json`
- Storage rules in `storage.rules`
- Hosting config in `firebase.json` (SPA rewrite to `/index.html`)
- **Never commit `.env` or `firebase-key.json`** — both in `.gitignore`

## Important Files
- `src/types/index.ts` — all interfaces, types, constants, labels
- `src/services/orderService.ts` — order creation with Firestore transaction, status machine
- `src/services/walletService.ts` — signup bonus, credit application
- `src/app/routes.tsx` — complete route map
- `src/features/auth/AuthContext.tsx` — auth state provider

## Testing
- No test framework configured yet (MVP)
- Verify with `npm run build` (zero TS errors) before deploying
- Manual test on mobile viewport after deploy

## Deferred (Post-MVP)
- Push notifications / proximity alerts
- Real payment integration (Stripe / iyzico)
- Deep links / referral system
- Cloud Functions for scheduled tasks (no-show auto-marking, stock reset)
- Advanced admin: complaints, offer takedown, CSV export
- Image upload for offers and business logos
- Internationalization (currently Turkish-only)
