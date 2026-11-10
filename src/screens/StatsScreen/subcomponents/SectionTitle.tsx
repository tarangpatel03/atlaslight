import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';

interface SectionTitleProps {
  title: string;
  /** Something small at the far end, e.g. a legend. */
  right?: ReactNode;
}

/** Title above a block of the Stats screen. */
export const SectionTitle = ({ title, right }: SectionTitleProps): ReactNode => (
  <View style={styles.row}>
    <AppText variant="subheading">{title}</AppText>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
