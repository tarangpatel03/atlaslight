/**
 * Atlaslight colour tokens. Dark only.
 * Amber = memories ("you were here"); aurora (teal → violet) = movement and numbers.
 * Source of truth: the Atlaslight design system's tokens.json.
 */
export const colors = {
  // Grounds, from lowest to highest
  bg: '#0a0e14',
  surface: '#111722',
  surfaceRaised: '#182030',
  surfaceOverlay: '#1f2939',
  /** Frosted panels over the map. Pair with a 24px blur; fall back to `glassFallback` without blur. */
  glass: 'rgba(17, 23, 34, 0.74)',
  glassFallback: 'rgba(17, 23, 34, 0.94)',

  // Lines
  hairline: '#243044',
  /** Input / secondary button / switch outline. Meets 3:1 on bg and surface. */
  controlBorder: '#5e6f8a',

  // Text
  ink: '#eef2f7',
  inkMuted: '#a3b0c2',
  /** Placeholders, coordinates. 4.5:1 on bg/surface/surfaceRaised only. */
  inkSubtle: '#8391a6',

  // Memory accent
  amber: '#f5b544',
  amberPressed: '#e5a12e',
  amberSoft: 'rgba(245, 181, 68, 0.16)',
  onAmber: '#1c1405',

  // Aurora accent
  auroraTeal: '#2dd4bf',
  /** Mark colour only (pins, rings). Use `violetInk` for violet text. */
  auroraViolet: '#8b5cf6',
  violetInk: '#b9a6ff',

  // Status
  success: '#2dd4bf',
  danger: '#ff7a70',
  focus: '#f5b544',
  scrim: 'rgba(5, 7, 11, 0.64)',

  // Map style
  mapWater: '#070b11',
  mapLand: '#121a26',
  mapBorder: '#2b3850',
  mapLabel: '#6f7e95',
  mapRoad: '#1a2433',
} as const;

export type ColorToken = keyof typeof colors;

/** Aurora gradient stops for react-native-svg / linear-gradient: always teal → violet. */
export const auroraGradient = [colors.auroraTeal, colors.auroraViolet] as const;

/** Journey accents, assigned in rotation on create. Existing tokens only; stored as hex so a backup keeps its look. */
export const JOURNEY_COLORS = [
  colors.amber,
  colors.auroraTeal,
  colors.violetInk,
  colors.danger,
  colors.inkMuted,
] as const;

export type JourneyColor = (typeof JOURNEY_COLORS)[number];
