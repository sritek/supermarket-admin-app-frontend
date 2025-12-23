import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data.data;
          set({ user, token, isAuthenticated: true });
          localStorage.setItem('token', token);
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error || 'Login failed',
          };
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ user: null, token: null, isAuthenticated: false });
            return false;
          }
          const response = await api.get('/auth/me');
          set({
            user: response.data.data,
            token,
            isAuthenticated: true,
          });
          return true;
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
          return false;
        }
      },
    })
);

export default useAuthStore;

