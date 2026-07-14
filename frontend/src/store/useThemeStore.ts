import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggleDark: () => void;
  setDark: (val: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggleDark: () =>
        set((state) => {
          const next = !state.isDark;
          document.documentElement.classList.toggle('dark', next);
          return { isDark: next };
        }),
      setDark: (val) => {
        document.documentElement.classList.toggle('dark', val);
        set({ isDark: val });
      },
    }),
    { name: 'nv-theme' }
  )
);

// Call on app startup to restore saved preference
export function initTheme() {
  const stored = localStorage.getItem('nv-theme');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.isDark) document.documentElement.classList.add('dark');
    } catch (_) {}
  }
}
