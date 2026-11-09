import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  status: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[8] },
  split: { flex: 1, flexDirection: 'row' },
  // Map slot and numbers on the left, timeline on the right (tablet).
  overview: { flex: 1 },
  timelinePane: { flex: 1, borderLeftWidth: 1, borderLeftColor: colors.hairline },
  timelineHeader: { gap: space[3], paddingTop: space[4], paddingBottom: space[3] },
  timelineTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footer: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.bg,
  },
});
