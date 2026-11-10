import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

const MARK = 28;
const BAR_MAX_WIDTH = 560;

export const styles = StyleSheet.create({
  root: { flex: 1 },
  // The mark is what you aim with: its centre is exactly the map's centre.
  markWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  mark: {
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    borderWidth: 2,
    borderColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.amber },
  back: { position: 'absolute', left: space[4], top: space[4] },
  // Full width on phones; on wide windows it stays a readable width in the middle.
  barWrap: {
    position: 'absolute',
    left: space[4],
    right: space[4],
    bottom: space[4],
    alignItems: 'center',
  },
  bar: { width: '100%', maxWidth: BAR_MAX_WIDTH, gap: space[3] },
  coords: { textAlign: 'center' },
  actions: { flexDirection: 'row', gap: space[3] },
  cancel: { flexShrink: 0 },
  confirm: { flex: 1 },
});
