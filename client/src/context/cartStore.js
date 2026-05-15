import { create } from 'zustand';
import { cartApi } from '../lib/api';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await cartApi.get();
      set({ cart: data.cart });
    } catch {
      // silently fail if not authenticated
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (bookId, quantity = 1) => {
    try {
      const { data } = await cartApi.add(bookId, quantity);
      set({ cart: data.cart });
      toast.success('Added to cart!', { icon: '📚' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  },

  updateQuantity: async (bookId, quantity) => {
    try {
      const { data } = await cartApi.update(bookId, quantity);
      set({ cart: data.cart });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  },

  removeFromCart: async (bookId) => {
    try {
      const { data } = await cartApi.remove(bookId);
      set({ cart: data.cart });
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Remove failed');
    }
  },

  clearCart: () => set({ cart: null }),

  // Computed
  get itemCount() {
    return get().cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  },

  get subtotal() {
    return (
      get().cart?.items?.reduce((sum, i) => sum + i.book?.price * i.quantity, 0) ?? 0
    );
  },
}));
