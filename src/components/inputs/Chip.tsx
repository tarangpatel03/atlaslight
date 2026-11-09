import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AppText, Icon, type IconName } from '@/components/brand';
import { usePressScale } from '@/hooks/usePressScale';
import { auroraGradient, colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';

export type ChipVariant = 'default' | 'wish' | 'live';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  selected?: boolean;
  /** Optional leading icon. */
  icon?: IconName;
  /** With `onPress` the chip is a button; without it, a static status chip. */
  onPress?: () => void;
  disabled?: boolean;
}

const CHIP_HEIGHT = 36;
const OUTLINE = 1.5;
/** Extends the touch area of the 36 dp chip to the 48 dp minimum. */
const HIT_SLOP = (sizes.touchMin - CHIP_HEIGHT) / 2;

interface ChipLook {
  border: string;
  text: string;
  fill: string;
}

const lookFor = (variant: ChipVariant, selected: boolean, disabled: boolean): ChipLook => {
  if (disabled) return { border: colors.hairline, text: colors.inkSubtle, fill: 'transparent' };
  if (variant === 'wish') {
    return {
      border: colors.auroraViolet,
      text: colors.violetInk,
      fill: selected ? colors.surfaceOverlay : 'transparent',
    };
  }
  if (variant === 'live') return { border: 'transparent', text: colors.ink, fill: 'transparent' };
  return selected
    ? { border: colors.amber, text: colors.amber, fill: colors.amberSoft }
    : { border: colors.controlBorder, text: colors.ink, fill: 'transparent' };
};

/** Pill chip: default, wish (violet) and live (aurora outline). A button when `onPress` is given. */
export const Chip = ({
  label,
  variant = 'default',
  selected = false,
  icon,
  onPress,
  disabled = false,
}: ChipProps): ReactNode => {
  const { style, handlers } = usePressScale();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const look = lookFor(variant, selected, disabled);
  const interactive = onPress !== undefined && !disabled;

  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <Pressable
      disabled={!interactive}
      hitSlop={onPress ? HIT_SLOP : undefined}
      onPress={onPress}
      {...(interactive ? handlers : {})}
    >
      {({ pressed }) => (
        <Animated.View
          onLayout={onLayout}
          style={[
            styles.chip,
            {
              borderColor: look.border,
              backgroundColor: pressed && interactive ? colors.surfaceOverlay : look.fill,
            },
            interactive && style,
          ]}
        >
          {variant === 'live' && !disabled && size.width > 0 ? (
            <Svg
              width={size.width}
              height={size.height}
              style={styles.outline}
              pointerEvents="none"
            >
              <Defs>
                <LinearGradient id="liveChipOutline" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={auroraGradient[0]} />
                  <Stop offset="1" stopColor={auroraGradient[1]} />
                </LinearGradient>
              </Defs>
              <Rect
                x={OUTLINE / 2}
                y={OUTLINE / 2}
                width={size.width - OUTLINE}
                height={size.height - OUTLINE}
                rx={(size.height - OUTLINE) / 2}
                fill="none"
                stroke="url(#liveChipOutline)"
                strokeWidth={OUTLINE}
              />
            </Svg>
          ) : null}
          {variant === 'live' && !disabled ? <View style={styles.dot} /> : null}
          {icon ? <Icon name={icon} size={18} color={look.text} /> : null}
          <AppText variant="caption" color={look.text}>
            {label}
          </AppText>
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: CHIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: OUTLINE,
  },
  outline: { position: 'absolute', top: -OUTLINE, left: -OUTLINE },
  dot: {
    width: space[2],
    height: space[2],
    borderRadius: radius.pill,
    backgroundColor: colors.auroraTeal,
  },
});
