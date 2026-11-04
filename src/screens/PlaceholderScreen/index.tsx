import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/brand/AppText';
import { Screen } from '@/components/layout/Screen';
import { colors } from '@/theme/colors';
import { styles } from './style';

/** Temporary home until the tab shell exists (Phase 2). */
export const PlaceholderScreen = (): ReactNode => (
  <Screen>
    <View style={styles.root}>
      <AppText variant="display">Atlaslight</AppText>
      <AppText variant="body" color={colors.inkMuted} style={styles.copy}>
        Your journeys will appear here.
      </AppText>
    </View>
  </Screen>
);
