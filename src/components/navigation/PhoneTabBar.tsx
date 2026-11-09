import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowClass } from '@/hooks/useWindowClass';
import { colors } from '@/theme/colors';
import { radius, shadows, sizes, space } from '@/theme/layout';
import { TabItem, type TabEntry } from './TabItem';

interface PhoneTabBarProps {
  entries: TabEntry[];
}

/** Floating pill tab bar for phones. Screens leave room for it with `bottomChrome`. */
export const PhoneTabBar = ({ entries }: PhoneTabBarProps): ReactNode => {
  const insets = useSafeAreaInsets();
  const { margin } = useWindowClass();

  return (
    <View style={[styles.bar, { left: margin, right: margin, bottom: insets.bottom + space[4] }]}>
      {entries.map((entry) => (
        <View key={entry.name} style={styles.slot}>
          <TabItem {...entry} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    height: sizes.tabBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glassFallback,
    ...shadows.float,
  },
  slot: { flex: 1, alignItems: 'center' },
});
