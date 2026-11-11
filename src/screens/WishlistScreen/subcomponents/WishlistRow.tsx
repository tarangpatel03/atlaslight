import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { WishlistEntry } from '@/api/wishlist.api';
import { AppText, Icon } from '@/components/brand';
import { MapPin } from '@/components/map';
import { colors } from '@/theme/colors';
import { sizes, space } from '@/theme/layout';
import { placeSubtitle } from '@/utils/wishlist.util';

interface WishlistRowProps {
  entry: WishlistEntry;
  onRemove: (entry: WishlistEntry) => void;
}

/** One wishlist place: violet mark, name, where it is, and a button to take it off. */
export const WishlistRow = ({ entry, onRemove }: WishlistRowProps): ReactNode => (
  <View style={styles.row}>
    <MapPin variant="wish" />
    <View style={styles.text}>
      <AppText variant="bodyStrong" numberOfLines={1}>
        {entry.name}
      </AppText>
      {placeSubtitle(entry) ? (
        <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
          {placeSubtitle(entry)}
        </AppText>
      ) : null}
    </View>
    <Pressable onPress={() => onRemove(entry)} style={styles.remove}>
      <Icon name="close" size={18} color={colors.inkMuted} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: sizes.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
  },
  text: { flex: 1 },
  remove: {
    width: sizes.touchMin,
    height: sizes.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
