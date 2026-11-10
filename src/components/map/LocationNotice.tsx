import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { GlassPanel } from '@/components/surfaces';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface LocationNoticeProps {
  /** Denied sends the user to Settings; unavailable (no fix, location off) offers another try. */
  kind: 'denied' | 'unavailable';
  onTryAgain: () => void;
  onClose: () => void;
}

/** Glass card over the map when live location did not start. */
export const LocationNotice = ({ kind, onTryAgain, onClose }: LocationNoticeProps): ReactNode => (
  <GlassPanel style={styles.panel}>
    <View style={styles.row}>
      <Icon name="alert" size={18} color={colors.danger} />
      <AppText variant="caption" color={colors.inkMuted} style={styles.message}>
        {kind === 'denied'
          ? 'Allow location to see where you are on the map.'
          : "Can't find you right now. Check that location is on, then try again."}
      </AppText>
      <Pressable onPress={onClose} hitSlop={space[2]}>
        <Icon name="close" size={18} color={colors.inkMuted} />
      </Pressable>
    </View>
    {kind === 'denied' ? (
      <AppButton
        label="Open settings"
        variant="secondary"
        onPress={() => void Linking.openSettings()}
      />
    ) : (
      <AppButton label="Try again" variant="secondary" onPress={onTryAgain} />
    )}
  </GlassPanel>
);

const styles = StyleSheet.create({
  panel: { gap: space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  message: { flex: 1 },
});
