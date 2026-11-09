import type { ReactNode, Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { AppBottomSheet, type AppBottomSheetRef } from './AppBottomSheet';

interface ConfirmSheetProps {
  ref?: Ref<AppBottomSheetRef>;
  title: string;
  message: string;
  /** Verb for the confirm button, e.g. "Delete journey". */
  confirmLabel: string;
  /** Red outlined confirm button for things that cannot be undone. */
  destructive?: boolean;
  /** Keeps the confirm button busy while the work runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A question in a bottom sheet: what will happen, a confirm button and a way out. Closed until opened by ref. */
export const ConfirmSheet = ({
  ref,
  title,
  message,
  confirmLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps): ReactNode => (
  <AppBottomSheet ref={ref} snapPoints={[280]} backdrop onClose={onCancel}>
    <View style={styles.text}>
      <AppText variant="title">{title}</AppText>
      <AppText variant="body" color={colors.inkMuted}>
        {message}
      </AppText>
    </View>
    <View style={styles.actions}>
      <AppButton
        label={confirmLabel}
        variant={destructive ? 'danger' : 'primary'}
        loading={loading}
        onPress={onConfirm}
      />
      <AppButton label="Cancel" variant="ghost" onPress={onCancel} />
    </View>
  </AppBottomSheet>
);

const styles = StyleSheet.create({
  text: { gap: space[2], paddingTop: space[2] },
  actions: { gap: space[2], paddingTop: space[3] },
});
