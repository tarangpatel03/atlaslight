import type { ReactNode } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import splashIcon from '@/assets/brand/splashIcon.png';
import { colors } from '@/theme/colors';

/** Size the Android launch screen draws the icon at (see `launch_background.xml`), so the two line up. */
const ICON_SIZE = 288;

/**
 * Shown while the database and settings load: the launch screen's dark ground and icon, so the app
 * opens on one screen from the first frame to the first real one.
 */
export const Splash = (): ReactNode => (
  <View style={styles.root}>
    <StatusBar barStyle="light-content" />
    <Image source={splashIcon} style={styles.icon} />
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  icon: { width: ICON_SIZE, height: ICON_SIZE },
});
