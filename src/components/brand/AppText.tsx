import type { ReactNode } from 'react';
import { Text, type TextProps } from 'react-native';
import { colors } from '@/theme/colors';
import { typography, type TypographyToken } from '@/theme/typography';

interface AppTextProps extends TextProps {
  variant?: TypographyToken;
  color?: string;
  children: ReactNode;
}

/** Themed text. Always drawn at 1x: the app ignores the system font scale (owner decision, see design brief). */
export const AppText = ({
  variant = 'body',
  color = colors.ink,
  style,
  children,
  ...rest
}: AppTextProps): ReactNode => (
  <Text {...rest} allowFontScaling={false} style={[typography[variant], { color }, style]}>
    {children}
  </Text>
);
