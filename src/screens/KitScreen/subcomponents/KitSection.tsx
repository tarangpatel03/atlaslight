import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface KitSectionProps {
  title: string;
  children: ReactNode;
}

/** A titled block of the Kit gallery. */
export const KitSection = ({ title, children }: KitSectionProps): ReactNode => (
  <View style={styles.section}>
    <AppText variant="overline" color={colors.inkMuted}>
      {title}
    </AppText>
    {children}
  </View>
);

const styles = StyleSheet.create({
  section: { gap: space[3], marginBottom: space[8] },
});
