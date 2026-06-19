import { create } from 'zustand';
import { User } from '@ui-builder/shared';
import axios from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const COLORS = ['#f87171', '#fb923c', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
export const getUserColor = (userId: string) => COLORS[userId.charCodeAt(0) % COLORS.length];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    set({ user: data.user, token: data.accessToken });
  },

  register: async (name, email, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, password }, { withCredentials: true });
    set({ user: data.user, token: data.accessToken });
  },

  logout: async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    try {
      const { data } = await axios.get('/api/auth/me', { withCredentials: true });
      set({ user: data.user, token: data.accessToken });
    } catch {
      set({ user: null, token: null });
    }
  },
}));
