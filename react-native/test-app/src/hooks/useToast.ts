// Toast hook - Easy toast notifications
import { useCallback } from 'react';
import { useToastStore } from '../stores/toastStore';

export const useToast = () => {
  const showToast = useToastStore((state) => state.showToast);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

