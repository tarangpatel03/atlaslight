import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sizes, space } from '@/theme/layout';

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
  /** Space to leave under scroll content so it clears the floating tab bar on phones. */
  bottomChrome: number;
  /** Columns for photo and journey grids. */
  gridColumns: number;
  /** Tiles per row in stat rows. */
  statColumns: number;
}

/** Size class of the current window; updates on rotation, fold and split-screen. */
export const useWindowClass = (): WindowInfo => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  let windowClass: WindowClass = 'compact';
  if (width >= EXPANDED_MIN_WIDTH) windowClass = 'expanded';
  else if (width >= MEDIUM_MIN_WIDTH) windowClass = 'medium';

  let margin: number = width < NARROW_WIDTH ? space[3] : space[4];
  if (windowClass === 'medium') margin = space[6];
  else if (windowClass === 'expanded') margin = space[8];

  const isCompact = windowClass === 'compact';

  return {
    windowClass,
    isLandscape: width > height,
    margin,
    width,
    height,
    bottomChrome: isCompact
      ? sizes.tabBarHeight + space[4] * 2 + insets.bottom
      : insets.bottom + space[6],
    gridColumns: { compact: 1, medium: 2, expanded: 3 }[windowClass],
    statColumns: { compact: 2, medium: 3, expanded: 4 }[windowClass],
  };
};
