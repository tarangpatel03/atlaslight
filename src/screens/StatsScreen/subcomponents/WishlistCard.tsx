import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useGetWishlistQuery } from '@/api/wishlist.api';
import { AppText } from '@/components/brand';
import { MapPin } from '@/components/map';
import { Card } from '@/components/surfaces';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { placeSubtitle } from '@/utils/wishlist.util';
import { SectionTitle } from './SectionTitle';

/** How many of the newest wishlist places the card lists. */
const SHOWN = 3;

/** "Next on your wishlist": the places added last. Nothing is drawn while the list is empty. */
export const WishlistCard = (): ReactNode => {
  const { data } = useGetWishlistQuery();
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionTitle title="Next on your wishlist" />
      <Card style={styles.card}>
        {data.slice(0, SHOWN).map((entry) => (
          <View key={entry.id} style={styles.row}>
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
          </View>
        ))}
        {data.length > SHOWN ? (
          <AppText variant="caption" color={colors.violetInk}>
            {`${data.length - SHOWN} more on your list`}
          </AppText>
        ) : null}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: space[3] },
  card: { gap: space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  text: { flex: 1 },
});
