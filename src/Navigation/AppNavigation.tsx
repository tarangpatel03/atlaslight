import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { Splash } from '@/components/feedback/Splash';
import { RootNavigator } from '@/Navigation/RootNavigator';
import { selectAuthStatus } from '@/store/slices/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.amber },
};

/** Waits for the stored session check, so a signed-in user never sees the login screen flash. */
export const AppNavigation = (): ReactNode => {
  const status = useAppSelector(selectAuthStatus);
  if (status === 'loading') return <Splash />;

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};
