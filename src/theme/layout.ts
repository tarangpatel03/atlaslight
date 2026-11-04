export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const sizes = {
  touchMin: 48,
  pinPhoto: 52,
  pinDot: 16,
  fab: 56,
  tabBarHeight: 64,
  railWidth: 88,
  panelWidth: 400,
} as const;

/** Layout switches on window width (not device type) so foldables and split screen work. */
export const breakpoints = {
  tablet: 600,
  tabletWide: 900,
} as const;

/**
 * Shadows use the `boxShadow` style prop (React Native 0.76+, New Architecture),
 * which renders the same on Android and iOS. On dark grounds elevation comes from
 * lighter surfaces first; shadows are only for things floating over the map.
 */
export const shadows = {
  float: { boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.45)' },
  pin: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.55)' },
  glowAmber: { boxShadow: '0px 0px 0px 6px rgba(245, 181, 68, 0.16)' },
  fab: { boxShadow: '0px 0px 0px 6px rgba(245, 181, 68, 0.16), 0px 12px 32px rgba(0, 0, 0, 0.45)' },
} as const;
