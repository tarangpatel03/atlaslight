import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fab } from '@/components/buttons';
import { colors } from '@/theme/colors';
import { sizes, space } from '@/theme/layout';
import { showToast } from '@/utils/toast.util';
import { TabItem, type TabEntry } from './TabItem';

interface TabletRailProps {
  entries: TabEntry[];
}

/** 88 dp navigation rail for medium and expanded windows: add button on top, Settings at the bottom. */
export const TabletRail = ({ entries }: TabletRailProps): ReactNode => {
  const insets = useSafeAreaInsets();
  // The last tab (Settings) is pinned to the bottom; the others sit under the add button.
  const main = entries.slice(0, -1);
  const pinned = entries.slice(-1);

  return (
    <View
      style={[
        styles.rail,
        {
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + space[4],
          paddingLeft: insets.left,
        },
      ]}
    >
      <Fab
        // The Add memory screen arrives in Phase 3.
        onPress={() => showToast.info('Adding memories arrives soon')}
      />
      <View style={styles.group}>
        {main.map((entry) => (
          <TabItem key={entry.name} {...entry} />
        ))}
      </View>
      <View style={styles.spacer} />
      {pinned.map((entry) => (
        <TabItem key={entry.name} {...entry} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  rail: {
    width: sizes.railWidth,
    alignItems: 'center',
    gap: space[6],
    borderRightWidth: 1,
    borderRightColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  group: { gap: space[2], alignItems: 'center' },
  spacer: { flex: 1 },
});
