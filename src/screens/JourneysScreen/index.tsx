import type { ReactNode } from 'react';
import { View } from 'react-native';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { styles } from './style';

/** Placeholder until journeys arrive (Phase 3). */
export const JourneysScreen = (): ReactNode => (
  <Screen>
    <View style={styles.root}>
      <EmptyState
        title="No journeys yet"
        message="Start one and your trips line up here, newest first."
      />
    </View>
  </Screen>
);
