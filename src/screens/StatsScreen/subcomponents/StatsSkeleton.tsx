import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';

const BLOCK_HEIGHTS = [152, 164, 240, 300];

/** Quiet placeholder blocks while the stats load (a flat `surface` block each, no shimmer). */
export const StatsSkeleton = (): ReactNode => (
  <View style={styles.wrap}>
    {BLOCK_HEIGHTS.map((height) => (
      <View key={height} style={[styles.block, { height }]} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: space[3] },
  block: { borderRadius: radius.lg, backgroundColor: colors.surface },
});
