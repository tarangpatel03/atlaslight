import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowClass } from '@/hooks/useWindowClass';
import { colors } from '@/theme/colors';

/** Caps content on wide windows so lines stay readable. */
const MAX_CONTENT_WIDTH = 640;

interface ScreenProps {
  children: ReactNode;
}

/** Screen wrapper: safe-area insets on every edge, window-class margins, content capped on wide windows. */
export const Screen = ({ children }: ScreenProps): ReactNode => {
  const { margin } = useWindowClass();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'right', 'bottom', 'left']}>
      <View style={[styles.content, { paddingHorizontal: margin }]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
