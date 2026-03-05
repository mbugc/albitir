Context
Albitir is a Turkey-based "Too Good To Go" clone — a PWA mobile-first web app for surplus food rescue. The /flows folder contains 9 detailed specification documents describing consumer onboarding, ordering, searching, browsing, saving/favourites, cancellation, profile management, and business signup/dashboard flows. These specs are modeled after the Too Good To Go iOS app and serve as our UX reference.
Goal: Build an end-to-end working MVP where a consumer can sign up, browse offers, reserve a surprise bag, and view their reservation — AND a business can sign up, create offers, and manage them. All powered by Firebase, with clean architecture, and payment as a placeholder.


A. Flow Analysis Summary
A.1 Screen Inventory (MVP Only)
Consumer Screens (14 screens)
#ScreenRouteDescription1Splash/Logo + auth check → redirect2Auth Selection/auth"Continue with Email" + Google (simplified from Apple/Facebook)3Email Login/Signup/auth/emailEmail input → detect new/existing → password4Signup Details/auth/signupName + country (Turkey default) + terms checkbox5Location Selection/auth/locationCity picker or "Use my location" + radius6Discover (Home)/discoverSectioned offer cards: Recommended, New, Nearby7Browse/browseFull vertical list of offers, sort control8Offer Detail/offers/:idHero image, price, rating, collection window, Reserve CTA9Reservation Sheet(modal on offer detail)Quantity stepper, price breakdown, Reserve button10Reservation Confirmation/reservations/:id/confirmedSuccess celebration + "what's next" info11My Reservations/reservationsList of user's reservations grouped by status12Reservation Detail/reservations/:idFull order info, pickup code, collection countdown13Favourites/favouritesSaved stores/offers list14Profile (Me)/profileImpact stats, settings links, logout
Business Screens (8 screens)
#ScreenRouteDescription15Business Auth/business/authLogin or "Sign up your store"16Business Signup/business/signupStore name, email, phone, country, category, surplus type17Business Dashboard/business/dashboardOffer cards list + "Create Surprise Bag" CTA18Create Offer — Step 1/business/offers/newName + description19Create Offer — Step 2/business/offers/new/pricingPrice tiers (original value → customer price)20Create Offer — Step 3/business/offers/new/scheduleQuantity per day, days of week, collection window21Create Offer — Review/business/offers/new/reviewReview all details + submit22Edit Offer/business/offers/:id/editEdit existing offer
Total: 22 screens
A.2 Navigation Structure
Consumer App (bottom tab bar):
├── Discover (/) — home feed with offer carousels
├── Browse (/browse) — all offers list with sort
├── Favourites (/favourites) — saved offers
└── Me (/profile) — profile, orders, settings
    └── My Reservations (/reservations)
        └── Reservation Detail (/reservations/:id)

Offer Detail (/offers/:id) — pushed from any tab
    └── Reservation modal (inline)
    └── Confirmation (/reservations/:id/confirmed)

Auth Flow (no tab bar):
├── /auth — selection screen
├── /auth/email — email entry + password
├── /auth/signup — name + terms
└── /auth/location — city + radius

Business App (separate layout, no consumer tab bar):
├── /business/auth — login/signup
├── /business/signup — multi-step store creation
├── /business/dashboard — offer management
└── /business/offers/new — multi-step offer wizard
A.3 Shared UI Component Inventory
ComponentUsed InDescriptionBottomTabBarAll consumer screens4 tabs: Discover, Browse, Favourites, MeOfferCardDiscover, Browse, Favourites, SearchStore image, logo, bag name, price, rating, distance, availability badge, heart iconButtonEverywherePrimary (teal), Secondary (outline), Disabled (grey), Loading (spinner)TextFieldAuth, Profile, Business formsLabel, placeholder, error state, clear buttonBottomSheetReservation, SortSlide-up modal with drag handleToastFavourite toggle, errorsTop banner with icon + message, auto-dismiss 3sBadgeOffer cards"X left" (yellow-green), "New" (white), "Sold out" (grey)QuantityStepperReservation sheet[-] count [+] with min/max boundsPriceDisplayOffer card, DetailOriginal (strikethrough) + discounted (teal, bold)RatingDisplayOffer card, DetailStar icon + score + optional countCollectionWindowOffer card, DetailClock icon + time range + "Today"/"Tomorrow" badgePageHeaderAll screensTitle + optional back arrow + optional right actionsSkeletonLoaderLists, DetailAnimated placeholder during data fetchEmptyStateLists, Favourites, ReservationsIllustration + message + CTAStepProgressBusiness offer wizardHorizontal step indicator (green bars)
A.4 Data Entity Inventory (Firestore Collections)

users — Consumer accounts
businesses — Store/business accounts
offers — Surprise bags listed by businesses
reservations — Consumer bookings of offers
favourites — User-offer/store favourites (subcollection or top-level)


B. MVP Scope Decisions
INCLUDED in MVP

 Consumer email+password auth (Firebase Auth)
 Consumer Google sign-in (replaces Apple/Facebook for web)
 Simplified onboarding (auth → name → location → done, NO carousel/push/email-optin)
 Discover feed with sectioned offer cards
 Browse page with list view + sort (Relevance, Distance, Price)
 Offer detail page with all key info
 Reservation flow with quantity selection + payment placeholder
 Pickup code generation (6-digit random)
 My Reservations list + detail with countdown
 Reservation cancellation (before collection window)
 Favourites (heart toggle + favourites tab)
 Basic profile page (impact stats placeholder, logout)
 Business email+password auth
 Business signup (store name, phone, category, surplus type, address)
 Business dashboard with offer list
 Create Surprise Bag wizard (name, price, schedule)
 Edit/deactivate offers
 Firestore security rules
 Turkish locale (₺ currency)

DEFERRED (post-MVP)

 Map view (Browse tab)
 Filters (collection day, time, food type, diet)
 Push notifications
 Email verification flow
 Onboarding carousel
 Cookie consent modal
 Donations / charity
 Help centre
 Contact support form
 Blog / Legal pages
 Hidden stores / vouchers
 Notification settings
 Payment method management (real payments)
 OTP verification
 Order rating system
 Store performance analytics
 Store financials / payouts
 Audit logs
 Multi-language support
 Advanced profile fields (gender, dietary prefs, birthday)
 Saved locations (Home/Work)


C. Firestore Data Model (Refined)
users collection
typescriptinterface User {
  id: string;                    // Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  country: string;               // "TR" default
  location: {
    city: string;                // "Istanbul"
    latitude: number;
    longitude: number;
    radiusKm: number;            // 1-50, default 10
  };
  favouriteOfferIds: string[];   // Array of offer IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
businesses collection
typescriptinterface Business {
  id: string;                    // Auto-generated doc ID
  ownerId: string;               // Firebase Auth UID
  name: string;
  email: string;
  phone: string;
  country: string;               // "TR"
  category: BusinessCategory;    // "restaurant" | "cafe" | "bakery" | "supermarket" | "hotel" | "other"
  surplusCategory: SurplusCategory; // "meals" | "bread_and_pastries" | "groceries" | "other"
  address: {
    line1: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  geo: GeoPoint;                 // Firestore GeoPoint
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
offers collection
typescriptinterface Offer {
  id: string;                    // Auto-generated doc ID
  businessId: string;            // FK → businesses
  businessName: string;          // Denormalized for card display
  businessLogo?: string;         // Storage URL
  title: string;                 // "Donut Surprise Bag"
  description: string;           // Max 200 chars
  category: SurplusCategory;
  priceOriginal: number;         // e.g., 300 (₺)
  priceDiscounted: number;       // e.g., 99 (₺)
  currency: string;              // "TRY"
  quantityTotal: number;         // Per day
  quantityAvailable: number;     // Decremented on reservation
  daysOfWeek: number[];          // [1,2,3,4,5] (Mon=1, Sun=7)
  pickupStart: string;           // "17:00" (HH:mm)
  pickupEnd: string;             // "19:00"
  images: string[];              // Storage URLs
  tags: string[];                // ["Bread & pastries"]
  isActive: boolean;
  geo: GeoPoint;                 // Copied from business for querying
  address: string;               // Denormalized
  rating: number;                // Placeholder: 0
  ratingCount: number;           // Placeholder: 0
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
reservations collection
typescriptinterface Reservation {
  id: string;                    // Auto-generated doc ID
  userId: string;                // FK → users (Auth UID)
  offerId: string;               // FK → offers
  businessId: string;            // FK → businesses
  offerTitle: string;            // Denormalized
  businessName: string;          // Denormalized
  businessAddress: string;       // Denormalized
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  tax: number;                   // Calculated: subtotal * 0.08 (KDV placeholder)
  total: number;
  pickupCode: string;            // 6-digit random code
  pickupDate: string;            // "2026-02-26" (ISO date)
  pickupStart: string;           // "17:00"
  pickupEnd: string;             // "19:00"
  status: "RESERVED" | "PICKED_UP" | "CANCELLED" | "EXPIRED";
  paymentStatus: "PLACEHOLDER";  // Always placeholder for MVP
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Indexes needed
- `offers`: `isActive` + `geo` (for location-based queries)
- `offers`: `isActive` + `category`
- `reservations`: `userId` + `createdAt` (desc)
- `reservations`: `offerId` + `status`

---

## D. Project Structure
```
/src
  /app
    App.tsx                      # Root component with router
    routes.tsx                   # Route definitions
    ConsumerLayout.tsx           # Layout with BottomTabBar
    BusinessLayout.tsx           # Layout for business screens
    AuthLayout.tsx               # Layout for auth screens (no tab bar)

  /components
    /ui
      Button.tsx
      TextField.tsx
      BottomSheet.tsx
      Toast.tsx
      Badge.tsx
      SkeletonLoader.tsx
      EmptyState.tsx
      StepProgress.tsx
      PageHeader.tsx
    /offer
      OfferCard.tsx
      PriceDisplay.tsx
      RatingDisplay.tsx
      CollectionWindow.tsx
      QuantityStepper.tsx
      AvailabilityBadge.tsx
    BottomTabBar.tsx

  /features
    /auth
      AuthSelectionPage.tsx
      EmailAuthPage.tsx
      SignupDetailsPage.tsx
      LocationSetupPage.tsx
      useAuth.ts                 # Auth hook (login, signup, logout, user state)
    /discover
      DiscoverPage.tsx
      OfferCarousel.tsx          # Horizontal scrollable section
    /browse
      BrowsePage.tsx
      SortSheet.tsx
    /offers
      OfferDetailPage.tsx
      ReservationSheet.tsx
      ReservationConfirmPage.tsx
    /reservations
      ReservationsPage.tsx
      ReservationDetailPage.tsx
    /favourites
      FavouritesPage.tsx
    /profile
      ProfilePage.tsx
    /business
      BusinessAuthPage.tsx
      BusinessSignupPage.tsx
      BusinessDashboardPage.tsx
      /create-offer
        CreateOfferStep1.tsx     # Name + description
        CreateOfferStep2.tsx     # Pricing
        CreateOfferStep3.tsx     # Schedule
        CreateOfferReview.tsx    # Review + submit

  /services
    firebase.ts                  # Firebase app init + exports
    authService.ts               # signUp, signIn, signOut, onAuthChange, getCurrentUser
    userService.ts               # getUser, updateUser, updateLocation
    offerService.ts              # getOffers, getOfferById, createOffer, updateOffer
    reservationService.ts        # createReservation (transaction), getMyReservations, cancelReservation
    favouriteService.ts          # toggleFavourite, getFavourites
    businessService.ts           # createBusiness, getBusiness, getBusinessOffers
    storageService.ts            # uploadImage, getImageUrl
    paymentService.ts            # PaymentService interface + DummyPaymentService

  /types
    index.ts                     # All TypeScript interfaces and enums

  /utils
    formatCurrency.ts            # Format ₺ amounts
    formatDate.ts                # Format pickup windows, relative dates
    generatePickupCode.ts        # Random 6-digit code
    calculateDistance.ts          # Haversine distance (optional, simple)
    cn.ts                        # Tailwind class merge utility

  /hooks
    useToast.ts
    useBottomSheet.ts

  main.tsx                       # Vite entry point
  index.css                      # Tailwind imports + global styles

/public
  manifest.json                  # PWA manifest
  icons/                         # App icons

firestore.rules                  # Security rules
firestore.indexes.json           # Composite indexes
firebase.json                    # Firebase config
.env.example                     # Firebase config keys template

E. Implementation Steps
STEP 1: Project Setup + Firebase Scaffold
What: Initialize Vite + React + TS project, install dependencies, set up Tailwind, configure Firebase (without secrets), create folder structure.
Files:

package.json (dependencies: react, react-router-dom, firebase, tailwindcss, clsx)
vite.config.ts
tailwind.config.ts
src/main.tsx
src/index.css
src/services/firebase.ts (init from env vars)
src/types/index.ts (all interfaces + enums)
.env.example
public/manifest.json

Test checklist:

 npm run dev starts without errors
 Tailwind classes render correctly
 Firebase initializes (check console log)
 TypeScript compiles with strict mode


STEP 2: Routing + Layout + Bottom Tab Bar
What: Set up React Router with all routes, create ConsumerLayout (with BottomTabBar), BusinessLayout, AuthLayout. Create placeholder pages for every route.
Files:

src/app/App.tsx
src/app/routes.tsx
src/app/ConsumerLayout.tsx
src/app/BusinessLayout.tsx
src/app/AuthLayout.tsx
src/components/BottomTabBar.tsx
All page files as stubs (just <h1>Page Name</h1>)

Test checklist:

 All routes render their placeholder
 Tab bar shows on consumer pages, hidden on auth/business
 Tab switching works
 Back navigation works
 Deep-linking to /offers/test-id works


STEP 3: Shared UI Components
What: Build all reusable components from the component inventory. Style them with Tailwind matching the TGTG design language (teal primary, 8px spacing, rounded corners, clean typography).
Files: All files under src/components/ui/ and src/components/offer/
Design tokens (Tailwind config):

Primary: teal-700 (#0E7C6B approximately)
Background: white
Text: slate-900 (primary), slate-500 (secondary)
Spacing: 8px base system
Border radius: rounded-xl for cards, rounded-full for buttons
Font: system font stack

Test checklist:

 Button renders all 4 states (default, disabled, loading, pressed)
 OfferCard displays all fields correctly
 BottomSheet opens/closes with animation
 Toast auto-dismisses after 3 seconds
 SkeletonLoader animates


STEP 4: Auth with Firebase
What: Implement email/password auth + Google sign-in. Create useAuth hook with auth state. Build auth flow screens. Implement auth-guarded routing.
Files:

src/services/authService.ts
src/services/userService.ts
src/features/auth/useAuth.ts
src/features/auth/AuthSelectionPage.tsx
src/features/auth/EmailAuthPage.tsx
src/features/auth/SignupDetailsPage.tsx
src/features/auth/LocationSetupPage.tsx

Auth flow:

/auth — "Albitir" logo + "Continue with Google" + "Continue with Email"
Email → check if exists → if new: signup flow, if existing: password login
Signup: Name, country (Turkey default), terms checkbox → create Firestore user doc
Location: City selector (hardcoded Turkish cities for MVP) + radius slider
→ Redirect to /discover

Test checklist:

 New user can sign up with email+password
 Existing user can log in
 Google sign-in works
 User doc created in Firestore on signup
 Unauthenticated users redirected to /auth
 Auth state persists across page refresh
 Logout clears session and redirects


STEP 5: Offers Listing (Discover + Browse)
What: Connect Discover and Browse pages to Firestore. Show real offer data. Implement sort on Browse. Heart toggle for favourites.
Files:

src/services/offerService.ts
src/services/favouriteService.ts
src/features/discover/DiscoverPage.tsx
src/features/discover/OfferCarousel.tsx
src/features/browse/BrowsePage.tsx
src/features/browse/SortSheet.tsx
src/features/favourites/FavouritesPage.tsx

Discover sections:

"Recommended for you" — all active offers sorted by proximity (placeholder: just all offers)
"New Surprise Bags" — offers created in last 7 days, with "New" badge
"Nearby" — sorted by distance

Browse:

Vertical list of all offers
Sort bottom sheet: Relevance (default), Price (low→high), Rating

Test checklist:

 Discover loads offers from Firestore
 Horizontal carousels scroll
 "See all" navigates to Browse with filter
 Browse shows all offers in vertical list
 Sort changes order
 Heart icon toggles favourite (optimistic UI + Firestore update)
 Favourites tab shows only favourited offers
 Skeleton loaders during fetch
 Empty state when no offers


STEP 6: Offer Detail + Reservation
What: Build offer detail page. Implement reservation flow with Firestore transaction (decrement quantity atomically). Generate pickup code. Payment placeholder.
Files:

src/features/offers/OfferDetailPage.tsx
src/features/offers/ReservationSheet.tsx
src/features/offers/ReservationConfirmPage.tsx
src/services/reservationService.ts
src/services/paymentService.ts
src/utils/generatePickupCode.ts

Offer detail layout:

Hero image (full width)
Back arrow + share + heart (top overlay)
Availability badge ("X left")
Business logo + name
Bag name, original price (strikethrough), discounted price (teal)
Rating + review count
Collection window + "Tomorrow" badge
Address (tappable)
"What you could get" description + category tag
Sticky "Reserve" button (bottom)

Reservation flow:

Tap "Reserve" → bottom sheet slides up
Store name + collection window reminder
Quantity stepper: [-] 1 [+] (min 1, max = quantityAvailable)
Price breakdown: Subtotal, Tax (8% KDV), Total
"Reserve now" button (payment placeholder — just proceeds)
→ Firestore transaction: decrement quantityAvailable, create reservation doc
→ Navigate to confirmation page with celebration UI

Payment placeholder:
typescriptinterface PaymentService {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
}

class DummyPaymentService implements PaymentService {
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1000));
    return { success: true, transactionId: 'dummy_' + Date.now() };
  }
}
Test checklist:

 Offer detail shows all fields from Firestore
 "Reserve" opens bottom sheet
 Quantity stepper respects min/max
 Price breakdown updates on quantity change
 "Reserve now" creates reservation in Firestore
 quantityAvailable decremented atomically
 Pickup code generated (6-digit)
 Confirmation page shows success
 If quantityAvailable = 0, Reserve button disabled
 Concurrent reservation attempt handles conflict (transaction retry)


STEP 7: My Reservations + Cancellation
What: Build reservations list and detail page. Show pickup code. Implement cancellation with confirmation modal.
Files:

src/features/reservations/ReservationsPage.tsx
src/features/reservations/ReservationDetailPage.tsx

Reservations list:

Grouped by status: Active (top), Past (bottom)
Card: Store logo + name, bag name, pickup date/time, status badge, total

Reservation detail:

Store name + address + "Get directions" link (Google Maps)
Pickup date + collection window
Bag name × quantity
Total paid
Pickup code (large, prominent — this is MVP's equivalent of "show at store")
If RESERVED: countdown to collection window + "Cancel" button
Cancel → confirmation modal → API call → re-increment quantityAvailable

Test checklist:

 Reservations list shows user's reservations
 Active reservations at top
 Reservation detail shows pickup code prominently
 Countdown timer updates live
 Cancel shows confirmation modal
 Cancel decrements reservation, increments offer quantity
 Cancelled reservation shows updated status


STEP 8: Profile Page
What: Build basic Me/Profile page with impact stats (placeholder), link to reservations, and logout.
Files:

src/features/profile/ProfilePage.tsx

Layout (simplified from TGTG):

User name + email
"YOUR IMPACT" section: ₺0 saved, 0 meals, 0 kg CO2 (all placeholder)
Menu items: Your orders → /reservations, Log out
Version string at bottom

Test checklist:

 Profile shows user name and email
 "Your orders" navigates to reservations
 Logout works and redirects to auth


STEP 9: Business Auth + Signup
What: Build business authentication and multi-step store signup flow.
Files:

src/features/business/BusinessAuthPage.tsx
src/features/business/BusinessSignupPage.tsx
src/services/businessService.ts

Business signup flow:

Email + password (Firebase Auth with custom claim or role field)
Store name, phone, country (Turkey default)
Store category (radio: Restaurant, Cafe, Bakery, Supermarket, Hotel, Other)
Surplus food category (radio: Meals, Bread & pastries, Groceries, Other)
Address (line1, city, postal code) — manual entry for MVP
Review all details → Submit → "We'll reach out shortly" confirmation
Business doc created in Firestore with status: "APPROVED" (auto-approve for MVP)

Test checklist:

 Business can sign up with email+password
 All signup steps collect correct data
 Business doc created in Firestore
 After signup, redirected to dashboard


STEP 10: Business Dashboard + Create Offer
What: Build business dashboard showing their offers, and the multi-step offer creation wizard.
Files:

src/features/business/BusinessDashboardPage.tsx
src/features/business/create-offer/CreateOfferStep1.tsx
src/features/business/create-offer/CreateOfferStep2.tsx
src/features/business/create-offer/CreateOfferStep3.tsx
src/features/business/create-offer/CreateOfferReview.tsx

Dashboard:

Business name header
"Create a Surprise Bag" CTA (if no offers)
Offer cards: status badge (Active/Inactive), image, name, "X of Y sold", collection window
Tap offer → edit

Create offer wizard (4 steps with progress bar):

Name + Description (200 char limit with counter)
Price: Original value (₺) + Customer price (₺) — validation: original > customer
Schedule: Quantity per day (segmented: 2/3/4/5/custom), days of week (toggle buttons), collection window (start time + end time)
Review: all fields displayed → "Create Surprise Bag" CTA

Test checklist:

 Dashboard shows business offers from Firestore
 Empty state with CTA when no offers
 Create offer wizard flows through all 4 steps
 Validation on each step (name required, price > customer price, at least 1 day selected)
 Offer doc created in Firestore on submit
 New offer appears on dashboard
 Offer appears in consumer Discover/Browse


F. Firestore Security Rules
javascriptrules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: can read/write own doc only
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }

    // Businesses: owner can read/write, consumers can read approved businesses
    match /businesses/{businessId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow delete: if false;
    }

    // Offers: anyone authenticated can read active offers, business owner can write
    match /offers/{offerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      // In production: restrict update to business owner + reservation transactions
      allow delete: if false;
    }

    // Reservations: user can read own, create own, update own (cancel)
    match /reservations/{reservationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if false;
    }
  }
}

G. Routing Table
typescript// Consumer Auth (no tab bar)
{ path: "/",              element: <SplashRedirect /> }
{ path: "/auth",          element: <AuthSelectionPage /> }
{ path: "/auth/email",    element: <EmailAuthPage /> }
{ path: "/auth/signup",   element: <SignupDetailsPage /> }
{ path: "/auth/location", element: <LocationSetupPage /> }

// Consumer App (with tab bar — requires auth)
{ path: "/discover",      element: <DiscoverPage /> }
{ path: "/browse",        element: <BrowsePage /> }
{ path: "/favourites",    element: <FavouritesPage /> }
{ path: "/profile",       element: <ProfilePage /> }
{ path: "/offers/:id",    element: <OfferDetailPage /> }
{ path: "/reservations",  element: <ReservationsPage /> }
{ path: "/reservations/:id",           element: <ReservationDetailPage /> }
{ path: "/reservations/:id/confirmed", element: <ReservationConfirmPage /> }

// Business (separate layout — requires auth + business role)
{ path: "/business/auth",      element: <BusinessAuthPage /> }
{ path: "/business/signup",    element: <BusinessSignupPage /> }
{ path: "/business/dashboard", element: <BusinessDashboardPage /> }
{ path: "/business/offers/new",          element: <CreateOfferStep1 /> }
{ path: "/business/offers/new/pricing",  element: <CreateOfferStep2 /> }
{ path: "/business/offers/new/schedule", element: <CreateOfferStep3 /> }
{ path: "/business/offers/new/review",   element: <CreateOfferReview /> }
{ path: "/business/offers/:id/edit",     element: <EditOfferPage /> }

H. Verification Plan
After each step, verify:

Manual testing — walk through the user flow on mobile viewport (Chrome DevTools)
Firestore console — check documents are created/updated correctly
Auth state — verify login/logout/redirect behavior
Responsive — test on 375px (iPhone SE) and 412px (Pixel) widths
Error states — test with network disabled, invalid inputs

End-to-end acceptance test (final):

Consumer signs up with email → sets name → picks Istanbul → lands on Discover
Consumer sees offers listed by a business
Consumer taps offer → sees detail → taps Reserve → selects qty 2 → taps "Reserve now"
Consumer sees confirmation with pickup code
Consumer navigates to "My Reservations" → sees the reservation
Consumer taps reservation → sees pickup code + countdown
Consumer cancels reservation → quantity restored on offer
Business signs up → creates a Surprise Bag → sees it on dashboard
Consumer refreshes Discover → new bag appears
