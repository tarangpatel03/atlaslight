import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    padding: space[6],
    backgroundColor: colors.bg,
  },
});
