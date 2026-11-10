import { StyleSheet } from 'react-native';
import { space } from '@/theme/layout';

export const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  /** Header and placeholder blocks while loading; the loaded layouts space their own sections. */
  content: { gap: space[6] },
  center: { flex: 1, justifyContent: 'center' },
});
