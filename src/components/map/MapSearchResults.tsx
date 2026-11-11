import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { MapStopItem } from '@/api/map.api';
import { AppText, Icon, type IconName } from '@/components/brand';
import { usePressScale } from '@/hooks/usePressScale';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';
import type { LocalSearchResults } from '@/utils/mapSearch.util';
import type { PlaceSuggestion } from '@/utils/photon.util';

interface MapSearchResultsProps {
  local: LocalSearchResults<MapStopItem>;
  places: PlaceSuggestion[];
  placesLoading: boolean;
  placesFailed: boolean;
  /** The text is long enough to ask for places. */
  placesAsked: boolean;
  onPickMemory: (stop: MapStopItem) => void;
  onPickJourney: (journeyId: string) => void;
  onPickPlace: (place: PlaceSuggestion) => void;
}

const subtitleOf = (place: PlaceSuggestion): string =>
  [place.locality, place.adminArea, place.countryName]
    .filter((part): part is string => part !== null && part !== place.name)
    .join(', ');

interface RowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

const Row = ({ icon, title, subtitle, onPress }: RowProps): ReactNode => {
  const { style, handlers } = usePressScale();

  return (
    <Pressable onPress={onPress} {...handlers}>
      <Animated.View style={[styles.row, style]}>
        <Icon name={icon} size={18} color={colors.inkMuted} />
        <View style={styles.rowText}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
};

/** Glass list under the search bar: your journeys and memories first, then places from Photon. */
export const MapSearchResults = ({
  local,
  places,
  placesLoading,
  placesFailed,
  placesAsked,
  onPickMemory,
  onPickJourney,
  onPickPlace,
}: MapSearchResultsProps): ReactNode => {
  const hasLocal = local.journeys.length + local.memories.length > 0;
  const noMatches =
    !hasLocal && placesAsked && !placesLoading && !placesFailed && places.length === 0;

  return (
    <ScrollView
      style={styles.panel}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {local.journeys.map((journey) => (
        <Row
          key={journey.id}
          icon="route"
          title={journey.title}
          subtitle="Journey"
          onPress={() => onPickJourney(journey.id)}
        />
      ))}
      {local.memories.map((stop) => (
        <Row
          key={stop.id}
          icon="mapPin"
          title={stop.title}
          subtitle={stop.journeyTitle}
          onPress={() => onPickMemory(stop)}
        />
      ))}
      {places.map((place) => (
        <Row
          key={`${place.latitude},${place.longitude},${place.name}`}
          icon="search"
          title={place.name}
          subtitle={subtitleOf(place)}
          onPress={() => onPickPlace(place)}
        />
      ))}
      {placesLoading ? <ActivityIndicator color={colors.amber} style={styles.status} /> : null}
      {placesFailed ? (
        <AppText variant="caption" color={colors.inkMuted} style={styles.status}>
          Can't reach place search. Check your connection.
        </AppText>
      ) : null}
      {noMatches ? (
        <AppText variant="caption" color={colors.inkMuted} style={styles.status}>
          Nothing found. Try another spelling.
        </AppText>
      ) : null}
      {!hasLocal && !placesAsked ? (
        <AppText variant="caption" color={colors.inkMuted} style={styles.status}>
          Keep typing to search places.
        </AppText>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  panel: {
    maxHeight: sizes.touchMin * 6,
    flexGrow: 0,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glassFallback,
  },
  row: {
    minHeight: sizes.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
  },
  rowText: { flex: 1 },
  status: { padding: space[3], alignSelf: 'flex-start' },
});
