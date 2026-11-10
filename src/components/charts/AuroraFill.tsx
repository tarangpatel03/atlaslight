import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { auroraGradient } from '@/theme/colors';

interface AuroraFillProps {
  /** Which way teal turns to violet: left to right, or bottom to top. */
  direction: 'horizontal' | 'vertical';
}

/** Fills its parent with the aurora gradient; the parent clips it to a shape (a bar, a pill). */
export const AuroraFill = ({ direction }: AuroraFillProps): ReactNode => {
  const horizontal = direction === 'horizontal';
  // Ids are shared on purpose: every instance of a direction defines the same gradient.
  const id = horizontal ? 'auroraFillH' : 'auroraFillV';
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="1"
          x2={horizontal ? '1' : '0'}
          y2={horizontal ? '1' : '0'}
        >
          <Stop offset="0" stopColor={auroraGradient[0]} />
          <Stop offset="1" stopColor={auroraGradient[1]} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};
