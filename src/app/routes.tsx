import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import AuthLayout from './AuthLayout';
import BusinessLayout from './BusinessLayout';
import ConsumerLayout from './ConsumerLayout';
import RequireAuth from './RequireAuth';

import RoleSelectPage from '@/features/auth/RoleSelectPage';
import AuthSelectionPage from '@/features/auth/AuthSelectionPage';
import EmailAuthPage from '@/features/auth/EmailAuthPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import SignupDetailsPage from '@/features/auth/SignupDetailsPage';
import LocationSetupPage from '@/features/auth/LocationSetupPage';

import DiscoverPage from '@/features/discover/DiscoverPage';
import BrowsePage from '@/features/browse/BrowsePage';
import FavouritesPage from '@/features/favourites/FavouritesPage';
import ProfilePage from '@/features/profile/ProfilePage';
import SettingsPage from '@/features/profile/SettingsPage';

import OfferDetailPage from '@/features/offers/OfferDetailPage';
import OrderConfirmPage from '@/features/orders/OrderConfirmPage';
import CheckoutPage from '@/features/checkout/CheckoutPage';

import OrdersPage from '@/features/orders/OrdersPage';
import OrderDetailPage from '@/features/orders/OrderDetailPage';

import BusinessAuthPage from '@/features/business/BusinessAuthPage';
import BusinessSignupPage from '@/features/business/BusinessSignupPage';
import BusinessDashboardPage from '@/features/business/BusinessDashboardPage';
import EditOfferPage from '@/features/business/EditOfferPage';
import MerchantOrdersPage from '@/features/business/MerchantOrdersPage';
import MerchantOrderDetailPage from '@/features/business/MerchantOrderDetailPage';
import ReviewStatusPage from '@/features/business/ReviewStatusPage';
import CreateOfferStep1 from '@/features/business/create-offer/CreateOfferStep1';
import CreateOfferStep2 from '@/features/business/create-offer/CreateOfferStep2';
import CreateOfferStep3 from '@/features/business/create-offer/CreateOfferStep3';
import CreateOfferReview from '@/features/business/create-offer/CreateOfferReview';

import AdminLayout from './AdminLayout';
import RequireAdmin from './RequireAdmin';
import AdminLoginPage from '@/features/admin/AdminLoginPage';
import AdminDashboardPage from '@/features/admin/AdminDashboardPage';
import MerchantReviewPage from '@/features/admin/MerchantReviewPage';

export const routes: RouteObject[] = [
  // Splash redirect
  {
    path: '/',
    element: <Navigate to="/discover" replace />,
  },

  // Auth flow — no tab bar
  {
    element: <AuthLayout />,
    children: [
      { path: '/auth', element: <RoleSelectPage /> },
      { path: '/auth/consumer', element: <AuthSelectionPage /> },
      { path: '/auth/business', element: <Navigate to="/business/auth" replace /> },
      { path: '/auth/email', element: <EmailAuthPage /> },
      { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/auth/signup', element: <SignupDetailsPage /> },
      { path: '/auth/location', element: <LocationSetupPage /> },
    ],
  },

  // Consumer app — tab bar, auth required
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ConsumerLayout />,
        children: [
          { path: '/discover', element: <DiscoverPage /> },
          { path: '/browse', element: <BrowsePage /> },
          { path: '/favourites', element: <FavouritesPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/offers/:id', element: <OfferDetailPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
          { path: '/orders/:id/confirmed', element: <OrderConfirmPage /> },
        ],
      },
    ],
  },

  // Business auth — no guard
  {
    element: <BusinessLayout />,
    children: [
      { path: '/business/auth', element: <BusinessAuthPage /> },
      { path: '/business/signup', element: <BusinessSignupPage /> },
      { path: '/business/review-status', element: <ReviewStatusPage /> },
    ],
  },

  // Business app — auth required
  {
    element: <RequireAuth />,
    children: [
      {
        element: <BusinessLayout />,
        children: [
          { path: '/business/dashboard', element: <BusinessDashboardPage /> },
          { path: '/business/offers/new', element: <CreateOfferStep1 /> },
          { path: '/business/offers/new/pricing', element: <CreateOfferStep2 /> },
          { path: '/business/offers/new/schedule', element: <CreateOfferStep3 /> },
          { path: '/business/offers/new/review', element: <CreateOfferReview /> },
          { path: '/business/offers/:id/edit', element: <EditOfferPage /> },
          { path: '/business/orders', element: <MerchantOrdersPage /> },
          { path: '/business/orders/:id', element: <MerchantOrderDetailPage /> },
        ],
      },
    ],
  },

  // Admin — hidden entry
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
          { path: '/admin/dashboard', element: <AdminDashboardPage /> },
          { path: '/admin/merchants', element: <MerchantReviewPage /> },
        ],
      },
    ],
  },
];
