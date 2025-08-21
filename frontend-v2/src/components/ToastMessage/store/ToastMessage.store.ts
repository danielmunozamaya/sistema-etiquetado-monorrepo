import { create } from "zustand";

type ToastType = "success" | "danger" | "warning" | "info";

interface ToastState {
  isVisible: boolean;
  message: string;
  type: ToastType;
  duration: number;
  activateToast: (args: {
    message: string;
    type?: ToastType;
    duration?: number;
  }) => void;
  hideToast: () => void;
}

const useToastStore = create<ToastState>((set) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    isVisible: false,
    message: "",
    type: "success",
    duration: 4000,

    activateToast: ({ message, type = "success", duration = 4000 }) => {
      if (timeoutId) clearTimeout(timeoutId);

      set({ isVisible: false });

      setTimeout(() => {
        set({ isVisible: true, message, type, duration });

        timeoutId = setTimeout(() => {
          set({ isVisible: false });
        }, duration);
      }, 0);
    },

    hideToast: () => {
      if (timeoutId) clearTimeout(timeoutId);
      set({ isVisible: false });
    },
  };
});

export default useToastStore;
