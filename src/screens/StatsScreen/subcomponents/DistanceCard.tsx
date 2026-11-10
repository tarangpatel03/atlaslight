import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '@/components/brand';
import { ProgressBar } from '@/components/charts';
import { Card } from '@/components/surfaces';
import { useCountUp } from '@/hooks/useCountUp';
import type { DistanceUnit } from '@/store/slices';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { formatEarthProgress } from '@/utils/format.util';
import { kmToMiles } from '@/utils/geo.util';

interface DistanceCardProps {
  distanceKm: number;
  /** Distance over the Earth's circumference; the bar stops at one lap. */
  earthFraction: number;
  units: DistanceUnit;
  /** Lets a row size the card, e.g. `{ flex: 1 }`. */
  style?: StyleProp<ViewStyle>;
}

/** The headline number: how far you have travelled, and how much of the Earth that is. */
export const DistanceCard = ({
  distanceKm,
  earthFraction,
  units,
  style,
}: DistanceCardProps): ReactNode => {
  const value = Math.round(units === 'mi' ? kmToMiles(distanceKm) : distanceKm);
  const shown = useCountUp(value);

  return (
    <Card style={[styles.card, style]}>
      <AppText variant="overline" color={colors.inkMuted}>
        Distance travelled
      </AppText>
      <View style={styles.number}>
        <AppText variant="statXl">{Math.round(shown).toLocaleString('en-US')}</AppText>
        <AppText variant="subheading" color={colors.inkMuted}>
          {units}
        </AppText>
      </View>
      <View style={styles.bar}>
        <ProgressBar progress={earthFraction} />
      </View>
      <AppText variant="caption" color={colors.inkMuted}>
        {formatEarthProgress(earthFraction)}
      </AppText>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { padding: space[5], gap: space[1] },
  number: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
  bar: { marginVertical: space[2] },
});
