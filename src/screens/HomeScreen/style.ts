import { StyleSheet } from 'react-native';
import { space } from '@/theme/layout';

export const styles = StyleSheet.create({
  header: { gap: space[3], paddingVertical: space[4] },
  body: { flex: 1, paddingVertical: space[4] },
  separator: { height: space[3] },
});
