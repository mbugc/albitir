# albitir

Turkish surplus food rescue platform — a "Too Good To Go" clone for Turkey. Businesses list surprise bags of surplus food at discounted prices, consumers discover and purchase them nearby.

**Live:** https://albitir-app.web.app

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (custom `@theme` tokens, primary teal `#0E7C6B`)
- **Backend:** Firebase v11 (Auth, Firestore, Storage, Hosting)
- **Maps:** Leaflet + react-leaflet (OpenStreetMap tiles)
- **QR Codes:** qrcode.react
- **Locale:** Turkish (tr-TR), currency ₺ (TRY)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env and fill in your Firebase config
cp .env.example .env

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Project Structure

```
src/
├── app/                    # App shell, layouts, routing, auth guards
│   ├── routes.tsx          # All route definitions
│   ├── ConsumerLayout.tsx  # Tab bar layout for consumers
│   ├── BusinessLayout.tsx  # Business app layout
│   ├── AdminLayout.tsx     # Admin panel layout (sidebar)
│   ├── RequireAuth.tsx     # Auth route guard
│   └── RequireAdmin.tsx    # Admin role route guard
├── components/
│   ├── ui/                 # Reusable UI: Button, Badge, TextField, BottomSheet, etc.
│   └── offer/              # Offer-specific: OfferCard, PriceDisplay, QuantityStepper, etc.
├── features/
│   ├── auth/               # Role select, email auth, forgot password, signup, location setup
│   ├── discover/           # Discover page (search, categories, carousels, map view)
│   ├── browse/             # Browse all offers with sorting
│   ├── favourites/         # Favourited offers
│   ├── offers/             # Offer detail, reservation sheet
│   ├── checkout/           # Dedicated checkout page with wallet credit
│   ├── orders/             # Consumer orders, order detail, rating prompt
│   ├── profile/            # Profile page, settings page
│   ├── business/           # Merchant: auth, signup, dashboard, offer CRUD, orders, review status
│   └── admin/              # Admin: login, dashboard, merchant review
├── services/               # Firebase service layer
│   ├── firebase.ts         # Firebase app initialization
│   ├── authService.ts      # signUp, signIn, resetPassword, Google auth
│   ├── userService.ts      # User CRUD
│   ├── businessService.ts  # Business CRUD + status updates
│   ├── offerService.ts     # Offer CRUD + queries
│   ├── orderService.ts     # Order creation (transaction), status machine, rating
│   ├── walletService.ts    # Signup bonus, credit application, transactions
│   ├── adminService.ts     # Admin stats, merchant review, recent orders
│   └── paymentService.ts   # Dummy payment (MVP placeholder)
├── types/index.ts          # All TypeScript interfaces + constants
├── hooks/                  # useBottomSheet, useToast
└── utils/                  # formatCurrency, formatDate, cn, calculateDistance, generatePickupCode
```

## Features

### Consumer
- **Discover:** Search, category chips (Yemek/Ekmek/Market/Diğer), Feed/Map toggle
- **Map View:** Leaflet map with offer pins, popup cards
- **Offer Detail:** Photos, price display with discount %, availability badge, pickup window
- **Checkout:** Dedicated page with pickup note, wallet credit toggle, price breakdown (subtotal + KDV - credit)
- **Orders:** Active/Past tabs, 4-digit pickup code + QR code, countdown timer
- **Rating:** 5-star + comment prompt after completed orders
- **Wallet:** 100 TL signup bonus, apply credit at checkout
- **Settings:** Notifications, location, legal, delete account

### Business (Merchant)
- **Onboarding:** 3-step signup (info → location → IBAN), pending review status
- **Review Status:** Shows application state (pending/in review/approved/needs info/rejected)
- **Dashboard:** Order stats, revenue summary, offer list with toggle
- **Create Offer:** 4-step wizard (info → pricing with discount % → schedule → review)
- **Order Management:** Tab filters (Yeni/Hazır/Teslim/Gelmedi), pickup code verification
- **Pricing:** Original price + discount % → auto-calculated discounted price, 25% commission preview

### Admin (Hidden)
- **Entry:** `/admin/login` (no UI links, Firestore `admins` collection check)
- **Dashboard:** Stats cards (orders, consumers, merchants), recent orders table
- **Merchant Review:** Approve / Reject / Request Info with admin notes

## Business Rules

- **No cancellation** — consumers cannot cancel orders (İptal yok)
- **Order states:** `CREATED → PAID → READY → COMPLETED`, `PAID/READY → NO_SHOW`
- **Commission:** 25% of discounted price (platform fee)
- **Tax:** 8% KDV on subtotal
- **Pickup code:** 4-digit numeric code + QR code
- **Order number:** `ORD-{id}` format
- **Wallet:** Amounts stored in kuruş (10000 = 100 TL)
- **Payment:** Dummy/placeholder for MVP — no real charges

## Firebase Setup

### Firestore Collections
- `users` — consumer profiles with wallet balance
- `businesses` — merchant profiles with review status
- `offers` — surprise bags with pricing and availability
- `orders` — order records with state machine
- `walletTransactions` — credit/debit records
- `admins` — admin user documents (add manually via Firebase Console)

### Deploy Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
firebase deploy --only hosting
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build locally |
