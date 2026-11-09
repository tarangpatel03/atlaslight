import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** A title, one sentence and an optional action. Also used for load errors. */
export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps): ReactNode => (
  <View style={styles.wrap}>
    <AppText variant="title" style={styles.center}>
      {title}
    </AppText>
    <AppText variant="body" color={colors.inkMuted} style={styles.center}>
      {message}
    </AppText>
    {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} /> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[12],
    paddingHorizontal: space[6],
  },
  center: { textAlign: 'center' },
});
