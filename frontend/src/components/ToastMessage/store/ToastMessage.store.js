import { create } from "zustand";

const useToastStore = create((set) => {
  let timeoutId = null;

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
