import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '@/components/buttons';
import { space } from '@/theme/layout';

interface MapButtonsProps {
  onLocate: () => void;
  /** Waiting for the first position fix. */
  locating?: boolean;
}

/** Round glass buttons on the map's right edge: go to my location. */
export const MapButtons = ({ onLocate, locating = false }: MapButtonsProps): ReactNode => (
  <View style={styles.column}>
    <IconButton icon="locate" onPress={onLocate} disabled={locating} />
  </View>
);

const styles = StyleSheet.create({
  column: { gap: space[2] },
});
