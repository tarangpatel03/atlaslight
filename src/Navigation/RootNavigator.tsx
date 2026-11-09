import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { MainTabs } from '@/Navigation/MainTabs';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { KitScreen } from '@/screens/KitScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Root stack. The app opens straight into the tabs; there is no sign-in. */
export const RootNavigator = (): ReactNode => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.Main} component={MainTabs} />
    {__DEV__ ? <Stack.Screen name={SCREENS.Kit} component={KitScreen} /> : null}
  </Stack.Navigator>
);
