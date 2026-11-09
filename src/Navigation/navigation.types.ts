import { SCREENS } from '@/Navigation/routes';

/** The four tabs of the main shell. */
export type MainTabParamList = {
  [SCREENS.Map]: undefined;
  [SCREENS.Journeys]: undefined;
  [SCREENS.Stats]: undefined;
  [SCREENS.Settings]: undefined;
};

/** Routes of the root stack. */
export type RootStackParamList = {
  [SCREENS.Main]: undefined;
  [SCREENS.Kit]: undefined;
};
