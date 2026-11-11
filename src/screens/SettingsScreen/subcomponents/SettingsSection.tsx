import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { Card } from '@/components/surfaces';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/** A titled group of settings on one flat card. */
export const SettingsSection = ({ title, children }: SettingsSectionProps): ReactNode => (
  <View style={styles.section}>
    <AppText variant="overline" color={colors.inkMuted}>
      {title}
    </AppText>
    <Card style={styles.card}>{children}</Card>
  </View>
);

const styles = StyleSheet.create({
  section: { gap: space[2] },
  card: { gap: space[3] },
});
