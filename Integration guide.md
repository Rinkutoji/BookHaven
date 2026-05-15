# BookHaven — Email + Order Tracking Integration Guide

## 1. Install Dependencies

```bash
# Backend
cd server
npm install nodemailer

# No extra client deps needed
```

---

## 2. Copy New Files

### Server
```
server/
  utils/emailService.js          ← Email service (Nodemailer + SendGrid)
  models/User.js                 ← Replace existing (adds verification fields)
  models/Order.js                ← Replace existing (adds timeline, tracking)
  controllers/authController.js  ← Replace existing (adds verify/reset flows)
  controllers/orderController.js ← Replace existing (adds admin + email triggers)
  routes/auth.js                 ← Replace existing (adds new endpoints)
  routes/orders.js               ← Replace existing (adds admin routes)
  middleware/auth.js             ← Replace existing (adds requireAdmin)
```

### Client
```
client/src/
  pages/VerifyEmail.jsx           ← New page
  pages/ForgotPassword.jsx        ← New page
  pages/ResetPassword.jsx         ← New page
  pages/OrderDetail.jsx           ← New page (replaces basic order page)
  pages/admin/AdminOrders.jsx     ← New admin page
  pages/admin/AdminOrderDetail.jsx← New admin page
  components/EmailVerificationBanner.jsx ← New banner component
  components/admin/AdminOrderStatusModal.jsx ← New modal
```

---

## 3. Update server/.env

```env
# Email (dev — leave blank to use auto Ethereal)
EMAIL_FROM=BookHaven <noreply@bookhaven.com>
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Email (production — SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
```

**Dev tip:** When `SMTP_USER` is blank, the service auto-creates a free
[Ethereal](https://ethereal.email) test account and prints a preview URL
in the terminal every time an email is sent. No real emails are delivered.

---

## 4. Update client/src/App.jsx

```jsx
// Imports
import VerifyEmail      from './pages/VerifyEmail';
import ForgotPassword   from './pages/ForgotPassword';
import ResetPassword    from './pages/ResetPassword';
import OrderDetail      from './pages/OrderDetail';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import EmailVerificationBanner from './components/EmailVerificationBanner';

// In your root Layout component
function Layout() {
  return (
    <>
      <EmailVerificationBanner />   {/* ← Add this */}
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

// In your <Routes>
<Route path="/verify-email"    element={<VerifyEmail />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password"  element={<ResetPassword />} />

<Route element={<ProtectedRoute />}>
  <Route path="/orders/:id" element={<OrderDetail />} />
</Route>

<Route element={<AdminRoute />}>
  <Route path="/admin/orders"     element={<AdminOrders />} />
  <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
</Route>

// AdminRoute guard
function AdminRoute() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
```

---

## 5. Update Login Page

Add a "Forgot password?" link:
```jsx
<Link to="/forgot-password" className="text-sm text-brand-500 hover:underline">
  Forgot password?
</Link>
```

---

## 6. API Endpoints Added

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/verify-email?token=` | Verify email token |
| POST | `/api/auth/resend-verification` | Resend verification email (auth required) |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Orders (user)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | My orders (paginated) |
| GET | `/api/orders/:id` | Order detail |
| POST | `/api/orders` | Create order |
| POST | `/api/orders/:id/cancel` | Cancel order |

### Orders (admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/admin/stats` | Dashboard stats |
| GET | `/api/orders/admin/list` | All orders (filters + pagination) |
| GET | `/api/orders/admin/:id` | Order detail |
| PATCH | `/api/orders/admin/:id/status` | Update status + send email |
| PATCH | `/api/orders/admin/:id/note` | Update admin note |

---

## 7. Email Templates Implemented

| Template | Trigger |
|----------|---------|
| `emailVerification` | On register |
| `welcome` | On email verified |
| `passwordReset` | On forgot-password |
| `orderConfirmation` | On order created |
| `orderShipped` | Admin marks as shipped |
| `orderDelivered` | Admin marks as delivered |
| `orderCancelled` | User or admin cancels |

---

## 8. Production: SendGrid Setup

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Verify your sender domain (Settings → Sender Authentication)
3. Create API key (Settings → API Keys → Full Access)
4. Set `SENDGRID_API_KEY=SG.xxx` in your Railway environment
5. Set `NODE_ENV=production`

That's it — the transport auto-switches to SendGrid in production.

---

## 9. MongoDB Migration

The updated models add new optional fields — no migration needed.
Existing documents will simply have `isEmailVerified: false` by default
(which is handled gracefully throughout).

To manually verify your demo accounts:
```js
// In MongoDB shell / Atlas
db.users.updateMany(
  { email: { $in: ["demo@bookhaven.com", "admin@bookhaven.com"] } },
  { $set: { isEmailVerified: true } }
)
```