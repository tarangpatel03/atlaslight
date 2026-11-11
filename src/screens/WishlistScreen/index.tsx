import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSavePlaceMutation } from '@/api/places.api';
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  type WishlistEntry,
} from '@/api/wishlist.api';
import { AppText, Icon } from '@/components/brand';
import { EmptyState } from '@/components/feedback';
import { FormFrame, SidePanelFrame } from '@/components/layout';
import { useWindowClass } from '@/hooks/useWindowClass';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { space } from '@/theme/layout';
import type { PlaceSuggestion } from '@/utils/photon.util';
import { showToast } from '@/utils/toast.util';
import { styles } from './style';
import { AddPlace, WishlistRow } from './subcomponents';

type WishlistScreenProps = NativeStackScreenProps<RootStackParamList, typeof SCREENS.Wishlist>;

/** Places to visit. Phone: a full screen. Wider windows: a panel on the right over the screen it came from. */
export const WishlistScreen = ({ navigation }: WishlistScreenProps): ReactNode => {
  const insets = useSafeAreaInsets();
  const { windowClass, margin } = useWindowClass();
  const panel = windowClass !== 'compact';
  const gutter = panel ? space[6] : margin;
  const { data, isError, refetch } = useGetWishlistQuery();
  const [savePlace] = useSavePlaceMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const close = (): void => navigation.goBack();

  const add = async (place: PlaceSuggestion): Promise<void> => {
    try {
      const saved = await savePlace(place).unwrap();
      const added = await addToWishlist({ placeId: saved.id }).unwrap();
      if (added) showToast.success(`${place.name} is on your wishlist`);
      else showToast.info('Already on your wishlist', place.name);
    } catch (e) {
      showToast.error("Couldn't add the place", e instanceof Error ? e.message : undefined);
    }
  };

  const remove = async (entry: WishlistEntry): Promise<void> => {
    try {
      await removeFromWishlist(entry.id).unwrap();
      showToast.success('Removed from your wishlist', entry.name);
    } catch (e) {
      showToast.error("Couldn't remove the place", e instanceof Error ? e.message : undefined);
    }
  };

  const list = ((): ReactNode => {
    if (isError) {
      return (
        <EmptyState
          title="Couldn't load your wishlist"
          message="Something went wrong reading it from this device."
          actionLabel="Try again"
          onAction={refetch}
        />
      );
    }
    if (data === undefined) return null;
    if (data.length === 0) {
      return (
        <EmptyState
          title="Nowhere on your list yet"
          message="Search for a place above and it lands on the map as a violet pin."
        />
      );
    }
    return (
      <View style={styles.list}>
        {data.map((entry) => (
          <WishlistRow key={entry.id} entry={entry} onRemove={(item) => void remove(item)} />
        ))}
      </View>
    );
  })();

  const body = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
    >
      <AddPlace onPick={add} />
      {list}
    </ScrollView>
  );

  if (panel) {
    return (
      <SidePanelFrame onClose={close}>
        <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={[styles.panelHeader, { paddingHorizontal: gutter }]}>
            <AppText variant="title">Wishlist</AppText>
            <Pressable onPress={close}>
              <Icon name="close" />
            </Pressable>
          </View>
          {body}
        </View>
      </SidePanelFrame>
    );
  }

  return (
    <FormFrame title="Wishlist" dialog={false} gutter={gutter} onClose={close}>
      {body}
    </FormFrame>
  );
};
