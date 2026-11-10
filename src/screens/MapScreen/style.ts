import { StyleSheet } from 'react-native';
import { space } from '@/theme/layout';

export const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  mapArea: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'center' },
  // Search, results and chips float over the map; touches outside them pass through to it.
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: space[2], gap: space[2] },
  bottom: { position: 'absolute', alignItems: 'flex-end', gap: space[3] },
  // Bottom-left, above the map attribution.
  onThisDay: { position: 'absolute', left: 0 },
});
