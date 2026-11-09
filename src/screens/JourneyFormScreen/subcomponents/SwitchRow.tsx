import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { Switch } from '@/components/inputs';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface SwitchRowProps {
  label: string;
  /** One line under the label saying what the switch does. */
  caption: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** A setting row: label and caption on the left, the switch on the right. */
export const SwitchRow = ({ label, caption, value, onValueChange }: SwitchRowProps): ReactNode => (
  <View style={styles.row}>
    <View style={styles.text}>
      <AppText variant="bodyStrong">{label}</AppText>
      <AppText variant="caption" color={colors.inkMuted}>
        {caption}
      </AppText>
    </View>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  text: { flex: 1, gap: space[1] },
});
