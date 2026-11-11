import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/layout';

interface SkeletonBlockProps {
  height: number;
  style?: StyleProp<ViewStyle>;
}

/** A quiet placeholder while data loads: a flat `surface` block, no shimmer. */
export const SkeletonBlock = ({ height, style }: SkeletonBlockProps): ReactNode => (
  <View style={[styles.block, { height }, style]} />
);

const styles = StyleSheet.create({
  block: { borderRadius: radius.lg, backgroundColor: colors.surface },
});
