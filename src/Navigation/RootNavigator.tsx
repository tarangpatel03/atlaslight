import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Root stack. The app opens straight into its screens; there is no sign-in. */
export const RootNavigator = (): ReactNode => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.Placeholder} component={PlaceholderScreen} />
  </Stack.Navigator>
);
