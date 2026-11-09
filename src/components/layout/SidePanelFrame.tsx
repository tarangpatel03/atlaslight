import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { sizes } from '@/theme/layout';

interface SidePanelFrameProps {
  onClose: () => void;
  children: ReactNode;
  /** Drawn over the whole frame (confirm sheets), outside the panel so they can span the screen. */
  overlay?: ReactNode;
}

/** A panel docked to the right edge over the screen it came from; tapping the dimmed area closes it. */
export const SidePanelFrame = ({ onClose, children, overlay }: SidePanelFrameProps): ReactNode => (
  <View style={styles.root}>
    <Pressable style={styles.backdrop} onPress={onClose} />
    <View style={styles.panel}>{children}</View>
    {overlay}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  panel: {
    width: sizes.panelWidth,
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
    backgroundColor: colors.bg,
  },
});
