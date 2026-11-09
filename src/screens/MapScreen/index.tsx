import type { ReactNode } from 'react';
import { View } from 'react-native';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { styles } from './style';

/** Placeholder until the map arrives (Phase 4). */
export const MapScreen = (): ReactNode => (
  <Screen>
    <View style={styles.root}>
      <EmptyState
        title="Your map is waiting"
        message="Add your first memory and it lands here as an amber pin."
      />
    </View>
  </Screen>
);
