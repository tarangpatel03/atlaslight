import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText, Icon, type IconName } from '@/components/brand';
import { usePressScale } from '@/hooks/usePressScale';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  /** Primary is the one amber-filled button of a screen. */
  variant?: ButtonVariant;
  /** Optional leading icon. */
  icon?: IconName;
  disabled?: boolean;
  /** Shows a spinner instead of the label and ignores presses. */
  loading?: boolean;
}

interface VariantLook {
  fill: string;
  fillPressed: string;
  border: string;
  text: string;
}

const LOOKS: Record<ButtonVariant, VariantLook> = {
  primary: {
    fill: colors.amber,
    fillPressed: colors.amberPressed,
    border: colors.amber,
    text: colors.onAmber,
  },
  secondary: {
    fill: 'transparent',
    fillPressed: colors.surfaceOverlay,
    border: colors.controlBorder,
    text: colors.ink,
  },
  ghost: {
    fill: 'transparent',
    fillPressed: colors.surfaceOverlay,
    border: 'transparent',
    text: colors.ink,
  },
  danger: {
    fill: 'transparent',
    fillPressed: colors.surfaceOverlay,
    border: colors.danger,
    text: colors.danger,
  },
};

/** Pill button in four variants that scales down while pressed. */
export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}: AppButtonProps): ReactNode => {
  const { style, handlers } = usePressScale();
  const look = LOOKS[variant];
  const textColor = disabled ? colors.inkSubtle : look.text;

  return (
    <Pressable disabled={disabled || loading} onPress={onPress} {...handlers}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.button,
            { backgroundColor: pressed ? look.fillPressed : look.fill, borderColor: look.border },
            disabled && variant === 'primary' && styles.disabledFill,
            disabled && variant !== 'primary' && styles.disabledBorder,
            style,
          ]}
        >
          {/* Content stays laid out (hidden) while loading so the button keeps its width. */}
          <View style={[styles.content, loading && styles.hidden]}>
            {icon ? <Icon name={icon} size={18} color={textColor} /> : null}
            <AppText variant="bodyStrong" color={textColor}>
              {label}
            </AppText>
          </View>
          {loading ? <ActivityIndicator color={textColor} style={styles.spinner} /> : null}
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.touchMin,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[8],
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  hidden: { opacity: 0 },
  spinner: { position: 'absolute' },
  disabledFill: { backgroundColor: colors.surfaceRaised, borderColor: colors.surfaceRaised },
  disabledBorder: { borderColor: colors.hairline },
});
