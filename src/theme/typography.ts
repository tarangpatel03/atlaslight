import type { TextStyle } from 'react-native';

/**
 * Font files live in src/assets/fonts and are linked with `npx react-native-asset`.
 * On Android the family name is the FILE NAME (without extension), and each weight is its
 * own file, so never combine `fontFamily` with `fontWeight` — pick the file instead.
 */
export const fonts = {
  displayMedium: 'Fraunces-Medium',
  displaySemiBold: 'Fraunces-SemiBold',
  sansRegular: 'Manrope-Regular',
  sansMedium: 'Manrope-Medium',
  sansSemiBold: 'Manrope-SemiBold',
  sansBold: 'Manrope-Bold',
  dataMedium: 'SpaceGrotesk-Medium',
  dataSemiBold: 'SpaceGrotesk-SemiBold',
} as const;

/** letterSpacing in RN is in points, not em: em × fontSize. */
const em = (value: number, fontSize: number) => value * fontSize;

const style = (fontFamily: string, fontSize: number, lineHeight: number, letterSpacingEm = 0): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing: em(letterSpacingEm, fontSize),
});

export const typography = {
  // Display — Fraunces. One display / displayXl per screen.
  displayXl: style(fonts.displaySemiBold, 40, 44, -0.02),
  display: style(fonts.displaySemiBold, 32, 36, -0.015),
  title: style(fonts.displaySemiBold, 22, 28, -0.01),

  // Interface — Manrope
  heading: style(fonts.sansBold, 20, 26),
  subheading: style(fonts.sansSemiBold, 17, 24),
  body: style(fonts.sansRegular, 15, 22),
  bodyStrong: style(fonts.sansSemiBold, 15, 22),
  caption: style(fonts.sansMedium, 13, 18),
  label: style(fonts.sansSemiBold, 12, 16),

  // Data — Space Grotesk, tabular figures so counters don't jitter
  statXl: { ...style(fonts.dataSemiBold, 44, 48, -0.02), fontVariant: ['tabular-nums'] },
  stat: { ...style(fonts.dataSemiBold, 28, 32, -0.01), fontVariant: ['tabular-nums'] },
  overline: { ...style(fonts.dataSemiBold, 11, 14, 0.08), textTransform: 'uppercase' },
  coord: { ...style(fonts.dataMedium, 12, 16), fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
