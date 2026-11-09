import { StyleSheet } from 'react-native';
import { sizes, space } from '@/theme/layout';

export const styles = StyleSheet.create({
  // The list pane and, on wide windows, the side panel sit side by side.
  root: { flex: 1, flexDirection: 'row' },
  pane: { flex: 1 },
  // 16 above the floating tab bar (bar height + its own 16 offset + 16); `right` comes from the margin.
  fab: { position: 'absolute', bottom: sizes.tabBarHeight + space[4] * 2 },
});
