import useToastStore from "../store/ToastMessage.store";

interface ActivateToastOptions {
  message: string;
  type?: "success" | "danger" | "warning" | "info";
  duration?: number;
}

export const activateToast = (options: ActivateToastOptions) => {
  const { activateToast } = useToastStore.getState();
  activateToast(options);
};
