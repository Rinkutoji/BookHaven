// src/context/cartStore.js
import { create } from 'zustand';
import { cartApi } from '../lib/api';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  // ✅ Fetch cart ពី backend
  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await cartApi.get();
      set({ cart: data.cart });
    } catch (err) {
      // ✅ Silently fail ប្រសិនបើ user មិន login
      if (err.response?.status !== 401) {
        console.error('fetchCart error:', err.message);
      }
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Add item to cart
  addToCart: async (bookId, quantity = 1) => {
    try {
      const { data } = await cartApi.add(bookId, quantity);
      set({ cart: data.cart });
      toast.success('Added to cart!', { icon: '📚' });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to add to cart';
      toast.error(msg);
    }
  },

  // ✅ Update item quantity
  updateQuantity: async (bookId, quantity) => {
    try {
      const { data } = await cartApi.update(bookId, quantity);
      set({ cart: data.cart });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Update failed';
      toast.error(msg);
    }
  },

  // ✅ Remove item from cart
  removeFromCart: async (bookId) => {
    try {
      const { data } = await cartApi.remove(bookId);
      set({ cart: data.cart });
      toast.success('Removed from cart');
    } catch (err) {
      const msg = err.response?.data?.message || 'Remove failed';
      toast.error(msg);
    }
  },

  // ✅ Clear cart locally (បន្ទាប់ពី logout ឬ order)
  clearCart: () => set({ cart: null }),

  // ── Computed values ───────────────────────────────────────────

  // ចំនួន item សរុបក្នុង cart
  get itemCount() {
    return get().cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  },

  // តម្លៃសរុប
  get subtotal() {
    return (
      get().cart?.items?.reduce(
        (sum, i) => sum + (i.book?.price ?? 0) * i.quantity,
        0
      ) ?? 0
    );
  },
}));