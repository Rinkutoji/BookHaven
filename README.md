# 📚 BookHaven — Full-Stack Bookstore

A warm, beautifully designed e-commerce bookstore built with React, Node.js, MongoDB, and Stripe.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| Payments | Stripe Checkout |
| Deploy | Vercel (frontend) + Railway (backend) |

## Project Structure

```
bookhaven/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level page components
│   │   ├── context/      # React context (cart, auth)
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # API client, utils
│   └── ...
└── server/          # Express backend
    ├── controllers/ # Route handler logic
    ├── models/      # Mongoose schemas
    ├── routes/      # Express routers
    ├── middleware/  # Auth, error handling
    └── config/      # DB, Stripe config
```

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Environment Variables

**server/.env**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bookhaven
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Seed Database

```bash
cd server && npm run seed
```

### 4. Run Dev Servers

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

## Deployment

### Frontend → Vercel
```bash
cd client
vercel --prod
# Set VITE_API_URL and VITE_STRIPE_PUBLISHABLE_KEY in Vercel dashboard
```

### Backend → Railway
1. Connect your GitHub repo to Railway
2. Set root directory to `/server`
3. Add all environment variables in Railway dashboard
4. Railway auto-detects Node.js and deploys on push

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List books (filter, sort, paginate) |
| GET | `/api/books/:id` | Single book |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/users/me` | Current user profile |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update quantity |
| DELETE | `/api/cart/remove/:bookId` | Remove item |
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist/toggle` | Add/remove from wishlist |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my` | User's order history |
| POST | `/api/checkout/create-session` | Stripe checkout session |
| POST | `/api/checkout/webhook` | Stripe webhook |
