import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '@/components/brand/AppText';
import { usePressScale } from '@/hooks/usePressScale';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner instead of the label and ignores presses. */
  loading?: boolean;
}

/** Primary button: pill shape that scales down while pressed. */
export const AppButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
}: AppButtonProps): ReactNode => {
  const { style, handlers } = usePressScale();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      {...handlers}
    >
      <Animated.View style={[styles.button, disabled && styles.disabled, style]}>
        {loading ? (
          <ActivityIndicator color={colors.onAmber} />
        ) : (
          <AppText variant="bodyStrong" color={disabled ? colors.inkSubtle : colors.onAmber}>
            {label}
          </AppText>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.touchMin,
    borderRadius: radius.pill,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[8],
  },
  disabled: { backgroundColor: colors.surfaceRaised },
});
