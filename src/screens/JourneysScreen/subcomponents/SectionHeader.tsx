import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { formatCount } from '@/utils/format.util';

interface SectionHeaderProps {
  label: string;
  /** Journeys in the section; omitted for the Ongoing section. */
  count: number | null;
}

/** Overline label (`Ongoing`, `2025`) with the journey count on the right. */
export const SectionHeader = ({ label, count }: SectionHeaderProps): ReactNode => (
  <View style={styles.header}>
    <AppText variant="overline" color={colors.inkMuted}>
      {label}
    </AppText>
    {count !== null ? (
      <AppText variant="coord" color={colors.inkSubtle}>
        {formatCount(count, 'journey', 'journeys')}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: space[6],
    paddingBottom: space[3],
  },
});
