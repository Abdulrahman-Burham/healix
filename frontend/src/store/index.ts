import { create } from 'zustand';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import type { User, VitalSigns, Alert } from '../types';

// ===== Auth Store =====
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, language: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('healix_token'),
  isAuthenticated: !!localStorage.getItem('healix_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      localStorage.setItem('healix_token', access_token);
      localStorage.setItem('healix_user', JSON.stringify(user));
      connectSocket(access_token);
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name, language) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', { email, password, name, language });
      const { access_token, user } = res.data;
      localStorage.setItem('healix_token', access_token);
      localStorage.setItem('healix_user', JSON.stringify(user));
      connectSocket(access_token);
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('healix_token');
    localStorage.removeItem('healix_user');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      localStorage.setItem('healix_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },

  loadUser: () => {
    const storedUser = localStorage.getItem('healix_user');
    const token = localStorage.getItem('healix_token');
    if (storedUser && token) {
      set({
        user: JSON.parse(storedUser),
        token,
        isAuthenticated: true,
      });
      connectSocket(token);
    }
  },
}));

// ===== Vitals Store =====
interface VitalsState {
  current: VitalSigns | null;
  history: VitalSigns[];
  alerts: Alert[];
  setCurrent: (data: VitalSigns) => void;
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
}

export const useVitalsStore = create<VitalsState>((set, get) => ({
  current: null,
  history: [],
  alerts: [],

  setCurrent: (data) => set({ current: data }),

  addAlert: (alert) =>
    set({ alerts: [alert, ...get().alerts].slice(0, 50) }),

  markAlertRead: (id) =>
    set({
      alerts: get().alerts.map((a) =>
        a._id === id ? { ...a, read: true } : a
      ),
    }),

  clearAlerts: () => set({ alerts: [] }),
}));

// ===== UI Store =====
interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  language: 'ar' | 'en';
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setLanguage: (lang: 'ar' | 'en') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  language: (localStorage.getItem('i18nextLng') as 'ar' | 'en') || 'en',

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  toggleSidebarCollapse: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setLanguage: (lang) => {
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    set({ language: lang });
  },
}));
