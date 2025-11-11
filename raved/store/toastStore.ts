import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'success',
  showToast: (message, type = 'success') => {
    set({ visible: true, message, type });
    // Auto-hide after 2.5 seconds (matching HTML prototype)
    setTimeout(() => {
      set({ visible: false });
    }, 2500);
  },
  hideToast: () => {
    set({ visible: false });
  },
}));

