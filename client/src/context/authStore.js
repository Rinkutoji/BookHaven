// src/context/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // ✅ Set user + token បន្ទាប់ពី login/register
      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      // ✅ Update token តែមួយមុខ (ប្រើសម្រាប់ refresh)
      setAccessToken: (accessToken) => set({ accessToken }),

      // ✅ Update user info (ប្រើសម្រាប់ profile update)
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // ✅ Logout — clear ទាំងអស់
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      // ✅ Helper — ពិនិត្យថា authenticated
      isLoggedIn: () => !!get().accessToken && !!get().user,
    }),
    {
      name: 'bookhaven-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);