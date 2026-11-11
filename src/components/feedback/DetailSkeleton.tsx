import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/theme/layout';
import { SkeletonBlock } from './SkeletonBlock';

/** Placeholder for a detail or edit screen while its record loads: a photo block and two text rows. */
export const DetailSkeleton = (): ReactNode => (
  <View style={styles.wrap}>
    <SkeletonBlock height={220} />
    <SkeletonBlock height={28} style={styles.title} />
    <SkeletonBlock height={72} />
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', gap: space[3], padding: space[4] },
  title: { width: '60%' },
});
