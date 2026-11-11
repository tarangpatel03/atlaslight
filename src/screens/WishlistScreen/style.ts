import { StyleSheet } from 'react-native';
import { space } from '@/theme/layout';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[3],
  },
  content: { gap: space[5], paddingBottom: space[8] },
  list: { gap: space[1] },
});
