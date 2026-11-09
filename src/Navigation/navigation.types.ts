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
  [SCREENS.JourneyDetail]: { journeyId: string };
  [SCREENS.JourneyForm]: { journeyId?: string } | undefined;
  [SCREENS.MemoryDetail]: { stopId: string };
  [SCREENS.MemoryForm]: { journeyId?: string; stopId?: string } | undefined;
  [SCREENS.Kit]: undefined;
};
