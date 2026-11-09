import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';

const PLACEHOLDER_ROWS = 3;

/** Quiet placeholder rows while the journeys load (a flat `surface` block each, no shimmer). */
export const ListSkeleton = (): ReactNode => (
  <View style={styles.wrap}>
    {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
      <View key={index} style={styles.row} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: space[3], paddingTop: space[6] },
  row: { height: 108, borderRadius: radius.lg, backgroundColor: colors.surface },
});
