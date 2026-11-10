import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { useCountUp } from '@/hooks/useCountUp';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { AuroraRing } from './AuroraRing';
import { Card } from './Card';

const RING_SIZE = 112;

interface StatTileProps {
  value: number;
  /** Shown beside the number, e.g. "km". */
  unit?: string;
  label: string;
  /** 0 to 1: puts the number inside an aurora ring. */
  progress?: number;
  /** A quiet line under the tile, e.g. "+2 this year". */
  sub?: string;
  /** Label above a smaller number (the Stats design); by default it sits under a big one (Journey detail). */
  labelFirst?: boolean;
  /** Width the tile asks for before it grows to share its row; a row of narrow tiles passes less than 150. */
  basis?: number;
}

/** Big number with a label; counts up once when it first appears. */
export const StatTile = ({
  value,
  unit,
  label,
  progress,
  sub,
  labelFirst = false,
  basis,
}: StatTileProps): ReactNode => {
  const shown = useCountUp(value);

  const inRing = progress !== undefined;
  // In a ring the unit goes under the number so a wide value like "1,240" stays inside the circle.
  const number = (
    <View style={inRing ? styles.numberStacked : styles.number}>
      <AppText variant={inRing || labelFirst ? 'stat' : 'statXl'}>
        {Math.round(shown).toLocaleString('en-US')}
      </AppText>
      {unit ? (
        <AppText variant="caption" color={colors.inkMuted}>
          {unit}
        </AppText>
      ) : null}
    </View>
  );

  const labelText = (
    <AppText variant="overline" color={colors.inkMuted}>
      {label}
    </AppText>
  );

  return (
    <Card style={[styles.tile, basis !== undefined && { flexBasis: basis }]}>
      <View accessible style={styles.content}>
        {labelFirst ? labelText : null}
        {inRing ? (
          <AuroraRing progress={progress} size={RING_SIZE}>
            {number}
          </AuroraRing>
        ) : (
          number
        )}
        {labelFirst ? null : labelText}
        {sub ? (
          <AppText variant="caption" color={colors.inkMuted}>
            {sub}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Stretch so tiles in one row share a height even when only some have a ring.
  tile: { flexGrow: 1, flexBasis: 150, alignSelf: 'stretch' },
  content: { alignItems: 'flex-start', gap: space[2] },
  number: { flexDirection: 'row', alignItems: 'baseline', gap: space[1] },
  numberStacked: { alignItems: 'center' },
});
