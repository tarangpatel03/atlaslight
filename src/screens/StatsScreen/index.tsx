import type { ReactNode } from 'react';
import { View } from 'react-native';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { styles } from './style';

/** Placeholder until stats arrive (Phase 5). */
export const StatsScreen = (): ReactNode => (
  <Screen>
    <View style={styles.root}>
      <EmptyState
        title="Nothing to measure yet"
        message="Distance, countries and states show up once you have a journey."
      />
    </View>
  </Screen>
);
