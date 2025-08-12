import useToastStore from "../store/ToastMessage.store";

export const activateToast = (options) => {
  const { activateToast } = useToastStore.getState();
  activateToast(options);
};
