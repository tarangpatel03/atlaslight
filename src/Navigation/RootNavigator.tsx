import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { MainTabs } from '@/Navigation/MainTabs';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { useWindowClass } from '@/hooks/useWindowClass';
import { JourneyDetailScreen } from '@/screens/JourneyDetailScreen';
import { JourneyFormScreen } from '@/screens/JourneyFormScreen';
import { MemoryDetailScreen } from '@/screens/MemoryDetailScreen';
import { MemoryFormScreen } from '@/screens/MemoryFormScreen';
import { KitScreen } from '@/screens/KitScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Root stack. The app opens straight into the tabs; there is no sign-in. */
export const RootNavigator = (): ReactNode => {
  const { windowClass } = useWindowClass();
  // Phones push a full screen; wider windows get a dialog over the screen they came from.
  const formOptions: NativeStackNavigationOptions | undefined =
    windowClass === 'compact' ? undefined : { presentation: 'transparentModal', animation: 'fade' };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREENS.Main} component={MainTabs} />
      <Stack.Screen name={SCREENS.JourneyDetail} component={JourneyDetailScreen} />
      <Stack.Screen name={SCREENS.JourneyForm} component={JourneyFormScreen} options={formOptions} />
      <Stack.Screen
        name={SCREENS.MemoryDetail}
        component={MemoryDetailScreen}
        options={formOptions}
      />
      <Stack.Screen name={SCREENS.MemoryForm} component={MemoryFormScreen} options={formOptions} />
      {__DEV__ ? <Stack.Screen name={SCREENS.Kit} component={KitScreen} /> : null}
    </Stack.Navigator>
  );
};
