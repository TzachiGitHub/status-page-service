import { create } from 'zustand';
import api from '../lib/api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, orgName: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const token = data.token || data.accessToken;
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  register: async (email, password, name, orgName) => {
    const { data } = await api.post('/auth/register', { email, password, name, orgName });
    const token = data.token || data.accessToken;
    if (token) {
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
    }
  },
  logout: () => {
    // Best-effort server-side logout
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
  },
}));
