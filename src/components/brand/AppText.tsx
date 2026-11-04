import type { ReactNode } from 'react';
import { Text, type TextProps } from 'react-native';
import { colors } from '@/theme/colors';
import { typography, type TypographyToken } from '@/theme/typography';

interface AppTextProps extends TextProps {
  variant?: TypographyToken;
  color?: string;
  children: ReactNode;
}

/** Themed text. Honours the user's font scale; pass `maxFontSizeMultiplier` only on tight UI. */
export const AppText = ({
  variant = 'body',
  color = colors.ink,
  style,
  children,
  ...rest
}: AppTextProps): ReactNode => (
  <Text {...rest} style={[typography[variant], { color }, style]}>
    {children}
  </Text>
);
