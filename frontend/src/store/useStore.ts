import { create } from 'zustand';
import { api, setAccessToken } from '../lib/apiClient';
import type { AuthResponse, User } from '../types/api';

export type { User } from '../types/api';

export type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

interface AppState {
  currentUser: User | null;
  status: SessionStatus;
  setSession: (user: User, accessToken: string) => void;
  updateCurrentUser: (user: User) => void;
  clearSession: () => void;
  bootstrap: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  status: 'idle',

  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ currentUser: user, status: 'authenticated' });
  },

  updateCurrentUser: (user) => set({ currentUser: user }),

  clearSession: () => {
    setAccessToken(null);
    set({ currentUser: null, status: 'guest' });
  },

  // Called once on app start. The httpOnly refresh cookie (if any) lets us
  // silently restore a session without ever persisting the access token.
  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      const res = await api.post<AuthResponse>('/api/auth/refresh');
      setAccessToken(res.accessToken);
      set({ currentUser: res.user, status: 'authenticated' });
    } catch {
      setAccessToken(null);
      set({ currentUser: null, status: 'guest' });
    }
  },
}));
