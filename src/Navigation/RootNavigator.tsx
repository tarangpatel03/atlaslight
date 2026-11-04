import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { HomeScreen } from '@/screens/HomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { useAppSelector } from '@/store/hooks';
import { selectAuthStatus } from '@/store/slices/authSlice';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** One app stack. The auth state decides which screens exist; there is no role branching. */
export const RootNavigator = (): ReactNode => {
  const status = useAppSelector(selectAuthStatus);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'signedIn' ? (
        <Stack.Screen name={SCREENS.Home} component={HomeScreen} />
      ) : (
        <Stack.Screen name={SCREENS.Login} component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};
