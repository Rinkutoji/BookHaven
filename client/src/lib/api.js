import axios from 'axios';
import { useAuthStore } from '../context/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send cookies (refresh token)
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
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
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
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

// ─── Typed API helpers ────────────────────────────────────────────────────────

export const booksApi = {
  list: (params) => api.get('/books', { params }),
  get: (id) => api.get(`/books/${id}`),
  genres: () => api.get('/books/genres'),
  addReview: (id, data) => api.post(`/books/${id}/reviews`, data),
};

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  guest: (email) => api.post('/auth/guest', { email }),
  me: () => api.get('/users/me'),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (bookId, quantity = 1) => api.post('/cart/add', { bookId, quantity }),
  update: (bookId, quantity) => api.put('/cart/update', { bookId, quantity }),
  remove: (bookId) => api.delete(`/cart/remove/${bookId}`),
  clear: () => api.delete('/cart/clear'),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  toggle: (bookId) => api.post('/wishlist/toggle', { bookId }),
};

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  my: () => api.get('/orders/my'),
  get: (id) => api.get(`/orders/${id}`),
};

export const checkoutApi = {
  createSession: (data) => api.post('/checkout/create-session', data),
  getSession: (sessionId) => api.get(`/checkout/session/${sessionId}`),
};
