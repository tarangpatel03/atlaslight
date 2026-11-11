import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { useGetWishlistQuery } from '@/api/wishlist.api';
import { AppText } from '@/components/brand';
import { Switch } from '@/components/inputs';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { colors } from '@/theme/colors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectShowPhotoPins,
  selectShowRoutes,
  selectShowVisitedRegions,
  setShowPhotoPins,
  setShowRoutes,
  setShowVisitedRegions,
} from '@/store/slices';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';

/** Which layers the Map tab draws, and the way into the Wishlist. */
export const MapSection = (): ReactNode => {
  const dispatch = useAppDispatch();
  const regions = useAppSelector(selectShowVisitedRegions);
  const routes = useAppSelector(selectShowRoutes);
  const photoPins = useAppSelector(selectShowPhotoPins);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { data: wishlist } = useGetWishlistQuery();

  return (
    <SettingsSection title="Map">
      <SettingsRow
        label="Visited regions"
        detail="Fill the countries and states you have been to"
        right={
          <Switch value={regions} onValueChange={(on) => dispatch(setShowVisitedRegions(on))} />
        }
      />
      <SettingsRow
        label="Journey routes"
        detail="Draw a line along each journey"
        right={<Switch value={routes} onValueChange={(on) => dispatch(setShowRoutes(on))} />}
      />
      <SettingsRow
        label="Photo pins"
        detail="Show photos on the pins when zoomed in"
        right={<Switch value={photoPins} onValueChange={(on) => dispatch(setShowPhotoPins(on))} />}
      />
      <SettingsRow
        label="Wishlist"
        detail="Places you want to visit, shown as violet pins"
        right={
          <AppText variant="caption" color={colors.violetInk}>
            {wishlist === undefined ? '...' : String(wishlist.length)}
          </AppText>
        }
        onPress={() => navigation.navigate(SCREENS.Wishlist)}
      />
    </SettingsSection>
  );
};
