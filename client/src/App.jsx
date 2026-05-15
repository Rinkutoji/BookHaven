import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmailVerificationBanner from './components/EmailVerificationBanner';
// Pages (lazy-loaded for performance)
import { lazy, Suspense } from 'react';
import PageLoader from './components/ui/PageLoader';

// ── Existing pages ────────────────────────────────────────────────────────────
const HomePage         = lazy(() => import('./pages/HomePage'));
const BooksPage        = lazy(() => import('./pages/BooksPage'));
const BookDetailPage   = lazy(() => import('./pages/BookDetailPage'));
const CartPage         = lazy(() => import('./pages/CartPage'));
const CheckoutPage     = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const WishlistPage     = lazy(() => import('./pages/WishlistPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const OrdersPage       = lazy(() => import('./pages/OrdersPage'));
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'));

// ── New pages ─────────────────────────────────────────────────────────────────
const OrderDetailPage         = lazy(() => import('./pages/OrderDetailPage'));
const VerifyEmailPage         = lazy(() => import('./pages/VerifyEmailPage'));
const VerifyEmailRequiredPage = lazy(() => import('./pages/VerifyEmailRequiredPage'));
const ForgotPasswordPage      = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage       = lazy(() => import('./pages/ResetPasswordPage'));
const SearchPage              = lazy(() => import('./pages/SearchPage'));
const AboutPage               = lazy(() => import('./pages/AboutPage'));
const ContactPage             = lazy(() => import('./pages/ContactPage'));

// ── Policy pages ──────────────────────────────────────────────────────────────
const PrivacyPolicyPage  = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfService'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicy'));

// ── Admin pages ───────────────────────────────────────────────────────────────
const AdminOrdersPage      = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetail'));

// ── Admin route guard ─────────────────────────────────────────────────────────
import { useAuthStore } from './context/authStore';

function AdminRoute() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}

// ── Root layout wrapper ───────────────────────────────────────────────────────
function RootLayout() {
  return (
    <>
      <EmailVerificationBanner />
      <Layout />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#faf4e8',
            color: '#1a0f0a',
            border: '1px solid #e3c48c',
            fontFamily: '"DM Sans", sans-serif',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff8f0' } },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<RootLayout />}>

            {/* ── Public ──────────────────────────────────────── */}
            <Route path="/"          element={<HomePage />} />
            <Route path="/books"     element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/cart"      element={<CartPage />} />
            <Route path="/search"    element={<SearchPage />} />
            <Route path="/about"     element={<AboutPage />} />
            <Route path="/contact"   element={<ContactPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />

            {/* ── Policy pages ────────────────────────────────── */}
            <Route path="/privacy-policy"   element={<PrivacyPolicyPage />}  />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/shipping-policy"  element={<ShippingPolicyPage />} />

            {/* ── Auth (email + password reset) ───────────────── */}
            <Route path="/verify-email/:token"   element={<VerifyEmailPage />} />
            <Route path="/verify-email-required" element={<VerifyEmailRequiredPage />} />
            <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* ── Protected (logged-in + email verified) ──────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout"      element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/wishlist"      element={<WishlistPage />} />
              <Route path="/profile"       element={<ProfilePage />} />
              <Route path="/orders"        element={<OrdersPage />} />
              <Route path="/orders/:id"    element={<OrderDetailPage />} />
            </Route>

            {/* ── Admin ───────────────────────────────────────── */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/orders"     element={<AdminOrdersPage />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}