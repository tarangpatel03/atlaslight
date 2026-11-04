import type { ReactNode } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

/** Shown while the stored session is read, so the app never opens on a blank screen. */
export const Splash = (): ReactNode => (
  <View style={styles.root}>
    <StatusBar barStyle="light-content" />
    <ActivityIndicator color={colors.amber} />
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
