import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '@/components/buttons';
import { space } from '@/theme/layout';

interface MapButtonsProps {
  onFit: () => void;
  onLocate: () => void;
  /** Waiting for the first position fix. */
  locating?: boolean;
}

/** Round glass buttons on the map's right edge: frame all memories, go to my location. */
export const MapButtons = ({ onFit, onLocate, locating = false }: MapButtonsProps): ReactNode => (
  <View style={styles.column}>
    <IconButton icon="fit" onPress={onFit} />
    <IconButton icon="locate" onPress={onLocate} disabled={locating} />
  </View>
);

const styles = StyleSheet.create({
  column: { gap: space[2] },
});
