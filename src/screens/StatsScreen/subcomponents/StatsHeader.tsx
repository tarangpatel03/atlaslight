import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface StatsHeaderProps {
  /** `March 2019`, when the first journey began; hidden until there is one. */
  since: string | null;
  /** One smaller title line, for the wide layout where the chips sit beside it. */
  wide?: boolean;
}

/** The screen's one display line, with when the travelling began above it. */
export const StatsHeader = ({ since, wide = false }: StatsHeaderProps): ReactNode => (
  <View style={styles.header}>
    {since ? (
      <AppText variant="overline" color={colors.inkMuted}>
        {`Since ${since}`}
      </AppText>
    ) : null}
    <AppText variant={wide ? 'display' : 'displayXl'}>
      {wide ? 'Your world, so far' : 'Your world,\nso far'}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  header: { gap: space[2], paddingTop: space[6] },
});
