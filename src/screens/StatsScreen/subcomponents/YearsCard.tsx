import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { YearBars, type YearCount } from '@/components/charts';
import { Card } from '@/components/surfaces';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { SectionTitle } from './SectionTitle';

/** Bars area of the compact card, counts included; shorter than the phone's 140 to fit a column. */
const COMPACT_BARS_HEIGHT = 120;

interface YearsCardProps {
  data: YearCount[];
  highlightYear: number;
  /** The wide layout's card: title inside, shorter bars, grows to fill its column. */
  compact?: boolean;
}

/** Journeys per year as bars. */
export const YearsCard = ({ data, highlightYear, compact = false }: YearsCardProps): ReactNode => {
  if (compact) {
    return (
      <Card style={styles.compactCard}>
        <AppText variant="overline" color={colors.inkMuted}>
          Journeys per year
        </AppText>
        <YearBars data={data} highlightYear={highlightYear} height={COMPACT_BARS_HEIGHT} />
      </Card>
    );
  }
  return (
    <View style={styles.section}>
      <SectionTitle title="Journeys per year" />
      <Card style={styles.card}>
        <YearBars data={data} highlightYear={highlightYear} />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: space[3] },
  card: { paddingTop: space[5] },
  compactCard: { flex: 1, gap: space[2], justifyContent: 'space-between' },
});
