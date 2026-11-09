import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText, Icon } from '@/components/brand';
import { usePressScale } from '@/hooks/usePressScale';
import { TAB_META, type TabName } from '@/Navigation/tabs';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';

/** One tab as the bars draw it. */
export interface TabEntry {
  name: TabName;
  focused: boolean;
  onPress: () => void;
}

/** Icon and label; amber when it is the active tab. */
export const TabItem = ({ name, focused, onPress }: TabEntry): ReactNode => {
  const { style, handlers } = usePressScale();
  const { icon, label } = TAB_META[name];
  const color = focused ? colors.amber : colors.inkMuted;

  return (
    <Pressable onPress={onPress} {...handlers}>
      <Animated.View style={[styles.item, style]}>
        <Icon name={icon} color={color} />
        <AppText variant="label" color={color} numberOfLines={1}>
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    minWidth: sizes.touchMin,
    minHeight: sizes.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    paddingHorizontal: space[2],
    borderRadius: radius.md,
  },
});
