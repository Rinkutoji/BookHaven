// src/lib/api.js
import axios from 'axios';
import { useAuthStore } from '../context/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // ✅ ត្រូវការសម្រាប់ refreshToken cookie (Vercel → Render)
});

// ── Request interceptor: Attach access token ──────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: Auto-refresh on TOKEN_EXPIRED ───────────
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // ✅ Only refresh if: 401 + TOKEN_EXPIRED code + not already retried
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      // If already refreshing — queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch(Promise.reject.bind(Promise));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // ✅ FIXED: "/auth/refresh-token" មិនមែន "/auth/refresh"
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ── Books API ─────────────────────────────────────────────────────
export const booksApi = {
  list:      (params) => api.get('/books', { params }),
  get:       (id)     => api.get(`/books/${id}`),
  genres:    ()       => api.get('/books/genres'),
  addReview: (id, data) => api.post(`/books/${id}/reviews`, data),
};

// ── Auth API ──────────────────────────────────────────────────────
export const authApi = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  logout:   ()      => api.post('/auth/logout'),
  me:       ()      => api.get('/auth/me'),           // ✅ /auth/me
  // ✅ FIXED: refresh-token endpoint
  refresh:  ()      => axios.post(
    `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
    {},
    { withCredentials: true }
  ),
};

// ── Cart API ──────────────────────────────────────────────────────
export const cartApi = {
  get:    ()                    => api.get('/cart'),
  add:    (bookId, quantity = 1) => api.post('/cart/add', { bookId, quantity }),
  update: (bookId, quantity)    => api.put('/cart/update', { bookId, quantity }),
  remove: (bookId)              => api.delete(`/cart/remove/${bookId}`),
  clear:  ()                    => api.delete('/cart/clear'),
};

// ── Wishlist API ──────────────────────────────────────────────────
export const wishlistApi = {
  get:    ()       => api.get('/wishlist'),
  toggle: (bookId) => api.post('/wishlist/toggle', { bookId }),
};

// ── Orders API ────────────────────────────────────────────────────
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  my:     ()     => api.get('/orders/my'),
  get:    (id)   => api.get(`/orders/${id}`),
};

// ── Checkout API ──────────────────────────────────────────────────
export const checkoutApi = {
  createSession: (data)      => api.post('/checkout/create-session', data),
  getSession:    (sessionId) => api.get(`/checkout/session/${sessionId}`),
};