import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { useWindowClass } from '@/hooks/useWindowClass';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { isTabName } from '@/Navigation/tabs';
import { PhoneTabBar } from './PhoneTabBar';
import { TabletRail } from './TabletRail';
import type { TabEntry } from './TabItem';

/** The navigator's tab bar: a floating pill on phones, a rail on wider windows. */
export const TabBar = ({ state, navigation }: BottomTabBarProps): ReactNode => {
  const { windowClass } = useWindowClass();

  const entries: TabEntry[] = [];
  state.routes.forEach((route, index) => {
    if (!isTabName(route.name)) return;
    const focused = state.index === index;
    entries.push({
      name: route.name,
      focused,
      onPress: () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
      },
    });
  });

  // The rail's + starts a journey on the Journeys tab and adds a memory on the other tabs.
  const onAdd = (): void => {
    const root = navigation.getParent<NavigationProp<RootStackParamList>>();
    root?.navigate(
      state.routes[state.index]?.name === SCREENS.Journeys ? SCREENS.JourneyForm : SCREENS.MemoryForm,
    );
  };

  return windowClass === 'compact' ? (
    <PhoneTabBar entries={entries} />
  ) : (
    <TabletRail entries={entries} onAdd={onAdd} />
  );
};
