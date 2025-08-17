export const executeWithRetry = async (
  targetFn: () => Promise<void>,
  delayMs = 200
): Promise<void> => {
  while (true) {
    try {
      await targetFn();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
