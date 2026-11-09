import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, shadows, space } from '@/theme/layout';

interface GlassPanelProps {
  children: ReactNode;
  /** Positioning is the caller's job. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Panel floating over the map (search bar, map sheet, map buttons). Use it over the map only,
 * never on plain screens. v1 uses the opaque-ish `glassFallback` instead of a blur.
 */
export const GlassPanel = ({ children, style }: GlassPanelProps): ReactNode => (
  <View style={[styles.panel, style]}>{children}</View>
);

const styles = StyleSheet.create({
  panel: {
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glassFallback,
    ...shadows.float,
  },
});
