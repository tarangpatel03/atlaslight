import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowClass } from '@/hooks/useWindowClass';
import { colors } from '@/theme/colors';

interface ScreenProps {
  children: ReactNode;
  /** Adds the window-class margin left and right. Turn off when the screen places its own edges (full-bleed lists, side panels). */
  padded?: boolean;
}

/** Screen wrapper: safe-area insets on every edge, window-class margins, content uses the full width (owner decision). */
export const Screen = ({ children, padded = true }: ScreenProps): ReactNode => {
  const { margin } = useWindowClass();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'right', 'bottom', 'left']}>
      <View style={[styles.content, padded && { paddingHorizontal: margin }]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, width: '100%' },
});
