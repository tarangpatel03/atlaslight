import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { space } from '@/theme/layout';

/** Mount once at the root, after the navigator, so toasts draw above every screen. */
export const AppToast = (): ReactNode => {
  const insets = useSafeAreaInsets();
  return <Toast topOffset={insets.top + space[2]} />;
};
