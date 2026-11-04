import { useWindowDimensions } from 'react-native';
import { space } from '@/theme/layout';

export type WindowClass = 'compact' | 'medium' | 'expanded';

/** Width breakpoints in dp. This hook is the only place these numbers live. */
const MEDIUM_MIN_WIDTH = 600;
const EXPANDED_MIN_WIDTH = 900;
/** Below this width the smaller screen margin is used. */
const NARROW_WIDTH = 360;

export interface WindowInfo {
  windowClass: WindowClass;
  isLandscape: boolean;
  /** Screen margin for this width. */
  margin: number;
  width: number;
  height: number;
}

/** Size class of the current window; updates on rotation, fold and split-screen. */
export const useWindowClass = (): WindowInfo => {
  const { width, height } = useWindowDimensions();
  let windowClass: WindowClass = 'compact';
  if (width >= EXPANDED_MIN_WIDTH) windowClass = 'expanded';
  else if (width >= MEDIUM_MIN_WIDTH) windowClass = 'medium';

  let margin: number = width < NARROW_WIDTH ? space[3] : space[4];
  if (windowClass === 'medium') margin = space[6];
  else if (windowClass === 'expanded') margin = space[8];

  return { windowClass, isLandscape: width > height, margin, width, height };
};
