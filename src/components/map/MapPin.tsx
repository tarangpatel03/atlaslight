import { useEffect, useState, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { mapPins } from '@/theme/mapPins';
import { springs } from '@/theme/motion';

export type MapPinVariant = 'dot' | 'photo' | 'cluster' | 'wish' | 'live';

interface MapPinProps {
  variant: MapPinVariant;
  /** Photo pins: file URI of the thumbnail. Without one (or if it fails to load) the pin is a dot. */
  uri?: string;
  /** Cluster pins: how many memories it holds. */
  count?: number;
  selected?: boolean;
  /** Springs in from nothing with a small overshoot (a pin dropped on the map). */
  drop?: boolean;
}

const DOT = 14;
const CLUSTER = 34;
const MARK = 22;

/**
 * A pin as a React view. On the map the dot and cluster are drawn by native layers (fast with
 * 1,000+ memories, see StopPins) and only photo pins use this component; the wish and live
 * looks are used by later checkpoints. The Kit screen shows every variant.
 */
export const MapPin = ({
  variant,
  uri,
  count,
  selected = false,
  drop = false,
}: MapPinProps): ReactNode => {
  const [failed, setFailed] = useState(false);
  const scale = useSharedValue(drop ? 0 : 1);

  useEffect(() => {
    if (drop) scale.value = withSpring(1, springs.pinDrop);
  }, [drop, scale]);

  const dropStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (variant === 'photo' && uri && !failed) {
    const size = selected ? mapPins.photoSizeSelected : mapPins.photoSize;
    return (
      <Animated.View
        style={[
          styles.photo,
          { width: size, height: size, borderRadius: size / 2 },
          selected && styles.photoSelected,
          dropStyle,
        ]}
      >
        <Image
          source={{ uri }}
          style={styles.photoImage}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      </Animated.View>
    );
  }

  if (variant === 'cluster') {
    return (
      <Animated.View style={[styles.cluster, dropStyle]}>
        <AppText variant="label" color={colors.onAmber}>
          {String(count ?? 0)}
        </AppText>
      </Animated.View>
    );
  }

  if (variant === 'wish') {
    return (
      <Animated.View style={[styles.wish, dropStyle]}>
        <View style={styles.wishCore} />
      </Animated.View>
    );
  }

  if (variant === 'live') return <LivePin />;

  // A dot, and the fallback for a photo pin without a usable thumbnail.
  return <Animated.View style={[styles.dot, selected && styles.dotSelected, dropStyle]} />;
};

/** Aurora pulse for the live location: a teal core with a violet ring that breathes out. */
const LivePin = (): ReactNode => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600 }), -1, false);
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 1.6 }],
  }));

  return (
    <View style={styles.liveWrap}>
      <Animated.View style={[styles.liveRing, ringStyle]} />
      <View style={styles.liveCore} />
    </View>
  );
};

const styles = StyleSheet.create({
  photo: {
    overflow: 'hidden',
    borderWidth: mapPins.ringWidth,
    borderColor: colors.amber,
    backgroundColor: colors.surfaceOverlay,
  },
  photoSelected: { borderColor: colors.ink },
  photoImage: { width: '100%', height: '100%' },
  cluster: {
    width: CLUSTER,
    height: CLUSTER,
    borderRadius: CLUSTER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.amber,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  dotSelected: { borderColor: colors.ink },
  wish: {
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.auroraViolet,
  },
  wishCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.auroraViolet,
  },
  liveWrap: { width: MARK * 2, height: MARK * 2, alignItems: 'center', justifyContent: 'center' },
  liveRing: {
    position: 'absolute',
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    borderWidth: 2,
    borderColor: colors.auroraViolet,
  },
  liveCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.auroraTeal,
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
