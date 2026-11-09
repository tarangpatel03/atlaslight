import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/brand';
import { usePressScale } from '@/hooks/usePressScale';
import { colors } from '@/theme/colors';
import { radius, shadows, sizes } from '@/theme/layout';

interface FabProps {
  onPress: () => void;
  icon?: IconName;
}

/** Round amber floating action button (the "add" action). */
export const Fab = ({ onPress, icon = 'plus' }: FabProps): ReactNode => {
  const { style, handlers } = usePressScale();

  return (
    <Pressable onPress={onPress} {...handlers}>
      {({ pressed }) => (
        <Animated.View style={[styles.fab, pressed && styles.pressed, style]}>
          <Icon name={icon} color={colors.onAmber} />
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: sizes.fab,
    height: sizes.fab,
    borderRadius: radius.pill,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  pressed: { backgroundColor: colors.amberPressed },
});
