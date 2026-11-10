import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState, type ReactNode } from 'react';
import { View, type NativeSyntheticEvent } from 'react-native';
import type { ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import { useGetStopsByJourneyQuery } from '@/api/stops.api';
import { AppText } from '@/components/brand';
import { AppButton, IconButton } from '@/components/buttons';
import { Screen } from '@/components/layout';
import { AtlasMap } from '@/components/map';
import { GlassPanel } from '@/components/surfaces';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { colors } from '@/theme/colors';
import { stopsBounds } from '@/utils/mapFeatures.util';
import { formatCoordinates } from '@/utils/memory.util';
import { showToast } from '@/utils/toast.util';
import { styles } from './style';

type MapPickScreenProps = NativeStackScreenProps<RootStackParamList, typeof SCREENS.MapPick>;

/**
 * Pick a memory's location on the map: pan the map under the fixed mark, then "Use this spot".
 * The point goes back to the memory form as a route param, so the form keeps what was typed.
 */
export const MapPickScreen = ({ navigation, route }: MapPickScreenProps): ReactNode => {
  const { latitude, longitude, journeyId } = route.params;
  const hasPoint = latitude !== undefined && longitude !== undefined;
  const { data: journeyStops } = useGetStopsByJourneyQuery(journeyId ?? '', {
    skip: hasPoint || journeyId === undefined,
  });
  // Open on the memory's point, else frame the journey's memories, else the whole world.
  const bounds = useMemo(
    () => (hasPoint ? stopsBounds([{ latitude, longitude }]) : stopsBounds(journeyStops ?? [])),
    [hasPoint, latitude, longitude, journeyStops],
  );
  const [center, setCenter] = useState<{ latitude: number; longitude: number } | null>(
    hasPoint ? { latitude, longitude } : null,
  );

  const handleRegionDidChange = (event: NativeSyntheticEvent<ViewStateChangeEvent>): void => {
    const [lng, lat] = event.nativeEvent.center;
    setCenter({ latitude: lat, longitude: lng });
  };

  const use = (): void => {
    if (!center) {
      showToast.info('Move the map to the spot first');
      return;
    }
    // Back to the form that is already open under this screen, with the spot added to its params.
    navigation.popTo(SCREENS.MemoryForm, { picked: center }, { merge: true });
  };

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        {/* Remount when the journey's memories arrive, so the opening frame fits them. */}
        <AtlasMap
          key={bounds?.join(',') ?? 'world'}
          initialBounds={bounds ?? undefined}
          onRegionDidChange={handleRegionDidChange}
        />
        <View style={styles.markWrap} pointerEvents="none">
          <View style={styles.mark}>
            <View style={styles.markDot} />
          </View>
        </View>
        <View style={styles.back}>
          <IconButton icon="chevronLeft" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.barWrap}>
          <GlassPanel style={styles.bar}>
            <AppText variant="coord" color={colors.inkMuted} style={styles.coords}>
              {center
                ? formatCoordinates(center.latitude, center.longitude)
                : 'Move the map to the spot'}
            </AppText>
            <View style={styles.actions}>
              <View style={styles.cancel}>
                <AppButton label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
              </View>
              <View style={styles.confirm}>
                <AppButton label="Use this spot" onPress={use} />
              </View>
            </View>
          </GlassPanel>
        </View>
      </View>
    </Screen>
  );
};
