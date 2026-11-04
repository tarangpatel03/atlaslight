import { auroraGradient, colors } from './colors';
import { radius, shadows, sizes, space } from './layout';
import { durations, PRESS_SCALE, springs, timings } from './motion';
import { fonts, typography } from './typography';

/**
 * Atlaslight theme. Dark only, so it's a plain constant — no ThemeProvider or context needed.
 * Import what you need: `import { theme } from '@/theme'` or the individual groups.
 */
export const theme = {
  colors,
  auroraGradient,
  fonts,
  typography,
  space,
  radius,
  sizes,
  shadows,
  springs,
  timings,
  durations,
  pressScale: PRESS_SCALE,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './layout';
export * from './mapStyle';
export * from './motion';
export * from './typography';
