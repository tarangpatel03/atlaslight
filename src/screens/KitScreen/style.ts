import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: space[4] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], alignItems: 'center' },
  iconCell: {
    width: sizes.touchMin,
    height: sizes.touchMin,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBlock: {
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.mapLand,
    gap: space[4],
  },
  swatch: { width: 96, gap: space[1] },
  swatchChip: {
    height: space[12],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
});
