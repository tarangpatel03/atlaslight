import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { breakpoints, sizes, space } from './layout';

export type LayoutClass = 'phone' | 'tablet' | 'tabletWide';

/**
 * Responsive layout from the WINDOW size, so split screen and foldables pick the right layout.
 * - phone: floating tab bar, bottom sheets, single column
 * - tablet: nav rail, map + side panel, 2-column grids
 * - tabletWide: 3-column photo grids, 4-up stat rows
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const layout: LayoutClass =
    width >= breakpoints.tabletWide ? 'tabletWide' : width >= breakpoints.tablet ? 'tablet' : 'phone';
  const isPhone = layout === 'phone';

  return {
    layout,
    isPhone,
    isTablet: !isPhone,
    isLandscape: width > height,
    width,
    height,
    insets,
    /** Horizontal screen gutter, excluding safe-area insets. */
    gutter: isPhone ? space[4] : space[6],
    /** Space to leave under scroll content so it clears the floating tab bar on phones. */
    bottomChrome: isPhone ? sizes.tabBarHeight + space[4] * 2 + insets.bottom : insets.bottom + space[6],
    gridColumns: layout === 'tabletWide' ? 3 : layout === 'tablet' ? 2 : 1,
    statColumns: layout === 'tabletWide' ? 4 : layout === 'tablet' ? 3 : 2,
  };
}
