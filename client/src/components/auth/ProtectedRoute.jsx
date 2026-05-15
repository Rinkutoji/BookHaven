// client/src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import PageLoader from '../ui/PageLoader';

/**
 * Guards protected routes:
 *   1. Must be logged in
 *   2. Must have verified email   ← NEW
 *
 * Uses <Outlet /> to match the existing App.jsx nested-route pattern:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/orders" element={<OrdersPage />} />
 *   </Route>
 */
export default function ProtectedRoute() {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Still hydrating (checking localStorage / refresh token)
  if (isLoading) return <PageLoader />;

  // Not logged in → redirect to login, remember where they wanted to go
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but email not verified → wall page with resend option
  if (!user.isEmailVerified) {
    return (
      <Navigate
        to="/verify-email-required"
        state={{ email: user.email, from: location }}
        replace
      />
    );
  }

  // All good — render the child route
  return <Outlet />;
}