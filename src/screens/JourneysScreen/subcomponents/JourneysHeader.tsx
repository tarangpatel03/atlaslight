import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface JourneysHeaderProps {
  /** e.g. `7 journeys · since 2024`; hidden when empty. */
  caption: string;
}

/** Screen title (the one display line of this screen) and a one-line summary. */
export const JourneysHeader = ({ caption }: JourneysHeaderProps): ReactNode => (
  <View style={styles.header}>
    <AppText variant="display">Journeys</AppText>
    {caption ? (
      <AppText variant="caption" color={colors.inkMuted}>
        {caption}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  header: { gap: space[1], paddingTop: space[6] },
});
