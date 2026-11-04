import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { RootNavigator } from '@/Navigation/RootNavigator';
import { colors } from '@/theme/colors';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.amber },
};

/** Navigation container with the app theme. */
export const AppNavigation = (): ReactNode => (
  <NavigationContainer theme={navigationTheme}>
    <RootNavigator />
  </NavigationContainer>
);
