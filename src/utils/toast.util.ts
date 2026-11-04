import Toast from 'react-native-toast-message';

/** Single entry point for toasts, so screens never import the library directly. */
export const showToast = {
  success: (title: string, message?: string): void =>
    Toast.show({ type: 'success', text1: title, text2: message }),
  error: (title: string, message?: string): void =>
    Toast.show({ type: 'error', text1: title, text2: message }),
  info: (title: string, message?: string): void =>
    Toast.show({ type: 'info', text1: title, text2: message }),
};
