import type { ReactNode } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Icon } from '@/components/brand';
import { colors } from '@/theme/colors';

interface CoverProps {
  /** A photo; without one the cover is the `surfaceOverlay` block with a map icon (never stock imagery). */
  source?: ImageSourcePropType;
  /** Size and corner radius come from the caller. */
  style: StyleProp<ViewStyle>;
  /** Darkens the bottom of a photo so text on it stays readable. */
  scrim?: boolean;
}

/** Photo (or the no-cover block) used by JourneyCard and MemoryCard. Photos are never filtered. */
export const Cover = ({ source, style, scrim = false }: CoverProps): ReactNode => (
  <View style={[styles.base, style]}>
    {source ? (
      <Image source={source} style={styles.image} resizeMode="cover" />
    ) : (
      <Icon name="map" color={colors.inkSubtle} />
    )}
    {source && scrim ? (
      <View style={styles.scrim} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="coverScrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.bg} stopOpacity={0} />
              <Stop offset="1" stopColor={colors.bg} stopOpacity={0.88} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#coverScrim)" />
        </Svg>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceOverlay,
  },
  image: { width: '100%', height: '100%' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
});
