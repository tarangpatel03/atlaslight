import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressScale } from '@/hooks/usePressScale';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';

interface CardProps {
  children: ReactNode;
  /** Makes the card a button. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Flat `surface` card: elevation comes from the lighter ground, not from a shadow. */
export const Card = ({ children, onPress, style }: CardProps): ReactNode => {
  const { style: scaleStyle, handlers } = usePressScale();

  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;

  return (
    <Pressable onPress={onPress} {...handlers}>
      {({ pressed }) => (
        <Animated.View style={[styles.card, pressed && styles.pressed, style, scaleStyle]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceOverlay },
});
