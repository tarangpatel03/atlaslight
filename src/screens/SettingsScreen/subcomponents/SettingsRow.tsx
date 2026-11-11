import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { sizes, space } from '@/theme/layout';

interface SettingsRowProps {
  label: string;
  /** Muted line under the label. */
  detail?: string;
  /** Control or value on the right, such as a Switch. */
  right?: ReactNode;
  /** Makes the whole row a button. */
  onPress?: () => void;
}

/** One label with an optional detail line and a control on the right. */
export const SettingsRow = ({ label, detail, right, onPress }: SettingsRowProps): ReactNode => {
  const content = (
    <>
      <View style={styles.text}>
        <AppText variant="body">{label}</AppText>
        {detail ? (
          <AppText variant="caption" color={colors.inkMuted}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {right}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: sizes.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  text: { flex: 1 },
});
