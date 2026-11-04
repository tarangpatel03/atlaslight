import { SCREENS } from '@/Navigation/routes';

/** Routes of the root stack. Signed-out users get Login, signed-in users get the app screens. */
export type RootStackParamList = {
  [SCREENS.Login]: undefined;
  [SCREENS.Home]: undefined;
};
