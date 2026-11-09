import type { IconName } from '@/components/brand';
import { SCREENS } from '@/Navigation/routes';
import type { MainTabParamList } from '@/Navigation/navigation.types';

export type TabName = keyof MainTabParamList;

export const TAB_META: Record<TabName, { icon: IconName; label: string }> = {
  [SCREENS.Map]: { icon: 'map', label: 'Map' },
  [SCREENS.Journeys]: { icon: 'journeys', label: 'Journeys' },
  [SCREENS.Stats]: { icon: 'stats', label: 'Stats' },
  [SCREENS.Settings]: { icon: 'settings', label: 'Settings' },
};

/** Narrows a route name from the navigator to one of our tabs. */
export const isTabName = (name: string): name is TabName => name in TAB_META;
