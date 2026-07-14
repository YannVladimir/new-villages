import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers
export const toast = {
  success: (message: string) => useToastStore.getState().addToast(message, 'success'),
  error: (message: string) => useToastStore.getState().addToast(message, 'error'),
  info: (message: string) => useToastStore.getState().addToast(message, 'info'),
  warning: (message: string) => useToastStore.getState().addToast(message, 'warning'),
};
