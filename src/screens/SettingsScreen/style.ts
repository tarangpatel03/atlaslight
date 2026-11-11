import { StyleSheet } from 'react-native';
import { space } from '@/theme/layout';

/** Settings stays one column; on a wider window it is centred and stops here instead of stretching. */
const COLUMN_MAX_WIDTH = 640;

export const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  content: { paddingTop: space[4] },
  column: { width: '100%', maxWidth: COLUMN_MAX_WIDTH, alignSelf: 'center', gap: space[6] },
});
