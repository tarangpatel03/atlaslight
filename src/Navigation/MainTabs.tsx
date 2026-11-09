import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ReactNode } from 'react';
import { TabBar } from '@/components/navigation';
import { useWindowClass } from '@/hooks/useWindowClass';
import { SCREENS } from '@/Navigation/routes';
import type { MainTabParamList } from '@/Navigation/navigation.types';
import { JourneysScreen } from '@/screens/JourneysScreen';
import { MapScreen } from '@/screens/MapScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { StatsScreen } from '@/screens/StatsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderTabBar = (props: BottomTabBarProps): ReactNode => <TabBar {...props} />;

/** The four tabs. One navigator for every size: the bar sits at the bottom on phones and on the left (rail) on wider windows. */
export const MainTabs = (): ReactNode => {
  const { windowClass } = useWindowClass();

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        tabBarPosition: windowClass === 'compact' ? 'bottom' : 'left',
      }}
    >
      <Tab.Screen name={SCREENS.Map} component={MapScreen} />
      <Tab.Screen name={SCREENS.Journeys} component={JourneysScreen} />
      <Tab.Screen name={SCREENS.Stats} component={StatsScreen} />
      <Tab.Screen name={SCREENS.Settings} component={SettingsScreen} />
    </Tab.Navigator>
  );
};
