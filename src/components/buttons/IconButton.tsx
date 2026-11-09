import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/brand';
import { usePressScale } from '@/hooks/usePressScale';
import { colors } from '@/theme/colors';
import { radius, sizes } from '@/theme/layout';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
}

/** Round glass button for controls floating over the map. */
export const IconButton = ({ icon, onPress, disabled = false }: IconButtonProps): ReactNode => {
  const { style, handlers } = usePressScale();

  return (
    <Pressable disabled={disabled} onPress={onPress} {...handlers}>
      {({ pressed }) => (
        <Animated.View
          style={[styles.button, pressed && styles.pressed, disabled && styles.disabled, style]}
        >
          <Icon name={icon} color={disabled ? colors.inkSubtle : colors.ink} />
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: sizes.touchMin,
    height: sizes.touchMin,
    borderRadius: radius.pill,
    backgroundColor: colors.glassFallback,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.surfaceOverlay },
  disabled: { opacity: 0.6 },
});
