import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useGetMapStopsQuery, type MapStopItem } from '@/api/map.api';
import { useGetWishlistQuery } from '@/api/wishlist.api';
import { Fab } from '@/components/buttons';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import {
  AtlasMap,
  LocationNotice,
  MapButtons,
  MapFilterChips,
  MapSearchBar,
  MapSearchResults,
  MapSheet,
  OnThisDayCard,
  RouteLines,
  StopPins,
  UserLocationPin,
  VisitedRegions,
  WishPins,
} from '@/components/map';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { useMapPins } from '@/hooks/useMapPins';
import { useMapSearch } from '@/hooks/useMapSearch';
import { useWindowClass } from '@/hooks/useWindowClass';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectMapFilter,
  selectSelectedStopId,
  selectShowPhotoPins,
  selectShowRoutes,
  selectShowVisitedRegions,
  setMapFilter,
  setSelectedStopId,
} from '@/store/slices';
import { sizes, space } from '@/theme/layout';
import { springs } from '@/theme/motion';
import {
  filterMapStops,
  journeyRoutes,
  stopsToPoints,
  type MapFilter,
} from '@/utils/mapFeatures.util';
import { findOnThisDay } from '@/utils/onThisDay.util';
import { visitedFeatures, visitedRegions } from '@/utils/region.util';
import type { PlaceSuggestion } from '@/utils/photon.util';
import { showToast } from '@/utils/toast.util';
import { styles } from './style';
import { MapPanel } from './subcomponents';

// The floating phone tab bar and the gap above it, measured from the bottom of the screen area.
const TAB_CLEARANCE = sizes.tabBarHeight + space[4];
// Search bar, gap and chip row; the map frames its stops below them.
const TOP_CHROME = space[2] + sizes.touchMin + space[2] + sizes.touchMin;
// On wider windows the search and chips stay a phone-sized column instead of stretching across the map.
const MAP_CHROME_MAX_WIDTH = 420;
// A stable empty list for hidden photo pins, so StopPins gets no new array each render.
const NO_STOPS: MapStopItem[] = [];
// Widest the On this day card gets on wide windows.
const ON_THIS_DAY_MAX_WIDTH = 360;

/**
 * Home tab: the world map with visited regions, journey routes, a pin for every memory and the
 * controls over it. The selected memory opens in a sheet on phones and tablet portrait, and in a
 * 400 dp side panel from the expanded size.
 */
export const MapScreen = (): ReactNode => {
  const { windowClass, margin, bottomChrome } = useWindowClass();
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { data, isError } = useGetMapStopsQuery();
  const filter = useAppSelector(selectMapFilter);
  const selectedId = useAppSelector(selectSelectedStopId);
  const showVisitedRegions = useAppSelector(selectShowVisitedRegions);
  const showRoutes = useAppSelector(selectShowRoutes);
  const showPhotoPins = useAppSelector(selectShowPhotoPins);
  const [loadFailed, setLoadFailed] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [onThisDayClosed, setOnThisDayClosed] = useState(false);
  const fittedOnce = useRef(false);
  const compact = windowClass === 'compact';
  const expanded = windowClass === 'expanded';

  const { data: wishlistData } = useGetWishlistQuery();
  const wishlist = useMemo(() => wishlistData ?? [], [wishlistData]);
  const allStops = useMemo(() => data ?? [], [data]);
  const stops = useMemo(() => filterMapStops(allStops, filter), [allStops, filter]);
  const points = useMemo(() => stopsToPoints(stops), [stops]);
  const regions = useMemo(() => visitedFeatures(visitedRegions(stops)), [stops]);
  const routes = useMemo(() => journeyRoutes(stops), [stops]);
  const pins = useMapPins(stops, {
    top: TOP_CHROME,
    bottom: compact ? bottomChrome + space[4] : bottomChrome,
    left: space[8],
    right: space[8],
  });
  const search = useMapSearch(allStops);
  const live = useLiveLocation(pins.flyToPoint);

  // One chip per journey that has memories on the map, in the order they were first visited.
  const journeys = useMemo(() => {
    const seen = new Map<string, string>();
    for (const stop of allStops) {
      if (!seen.has(stop.journeyId)) seen.set(stop.journeyId, stop.journeyTitle);
    }
    return [...seen].map(([id, title]) => ({ id, title }));
  }, [allStops]);

  // From all memories, whatever the chip filter says: this card is part of the home view.
  const onThisDay = useMemo(() => findOnThisDay(allStops), [allStops]);

  const selectedStop = stops.find((stop) => stop.id === selectedId) ?? null;

  // The tablet panel slides in over the map's right edge; the map buttons move aside with it.
  const panelOpen = expanded && selectedStop !== null;
  const panelProgress = useSharedValue(0);
  useEffect(() => {
    panelProgress.set(withSpring(panelOpen ? 1 : 0, springs.gentle));
  }, [panelOpen, panelProgress]);
  const buttonsShift = useAnimatedStyle(() => ({
    transform: [{ translateX: -panelProgress.get() * sizes.panelWidth }],
  }));

  useEffect(() => {
    if (isError) showToast.error('Could not load your memories', 'Reopen the map to try again.');
  }, [isError]);

  // The opening view frames everything once the memories are in; an empty map keeps the world view.
  // It waits for the map to load: a camera move sent before that is dropped, so a cold start stayed on the world view.
  // The guard makes later runs (the controller changes every render) do nothing, so the camera never jumps.
  useEffect(() => {
    if (fittedOnce.current || !mapLoaded || allStops.length === 0) return;
    fittedOnce.current = true;
    pins.fitToStops(allStops);
  }, [allStops, mapLoaded, pins]);

  const handleLoadError = (): void => {
    setLoadFailed(true);
    showToast.error('Map did not load', 'Check your connection and reopen the map.');
  };

  const changeFilter = (next: MapFilter): void => {
    dispatch(setMapFilter(next));
    pins.fitToStops(filterMapStops(allStops, next));
  };

  const pickJourney = (journeyId: string): void => {
    search.clear();
    changeFilter({ kind: 'journey', journeyId });
  };

  const pickMemory = (stop: MapStopItem): void => {
    search.clear();
    // The chip filter may hide this memory; show everything so the pin is there to select.
    if (!stops.some((item) => item.id === stop.id)) dispatch(setMapFilter({ kind: 'all' }));
    dispatch(setSelectedStopId(stop.id));
    pins.flyToPoint(stop.latitude, stop.longitude);
  };

  const pickPlace = (place: PlaceSuggestion): void => {
    search.clear();
    pins.flyToPoint(place.latitude, place.longitude);
  };

  const openMemory = (stopId: string): void =>
    navigation.navigate(SCREENS.MemoryDetail, { stopId });

  const isEmpty = data !== undefined && data.length === 0;

  // Search and its results stay a phone-sized column on wide windows; the chips may use the full width.
  const searchColumn = {
    paddingHorizontal: margin,
    maxWidth: compact ? undefined : MAP_CHROME_MAX_WIDTH + margin * 2,
  };

  const chrome = (
    <>
      <View style={styles.top} pointerEvents="box-none">
        <View style={searchColumn}>
          <MapSearchBar text={search.text} onChangeText={search.setText} onClear={search.clear} />
        </View>
        {search.active ? (
          <View style={searchColumn}>
            <MapSearchResults
              local={search.local}
              places={search.places}
              placesLoading={search.placesLoading}
              placesFailed={search.placesFailed}
              placesAsked={search.text.trim().length >= 3}
              onPickMemory={pickMemory}
              onPickJourney={pickJourney}
              onPickPlace={pickPlace}
            />
          </View>
        ) : (
          <MapFilterChips
            filter={filter}
            journeys={journeys}
            gutter={margin}
            wishCount={wishlist.length}
            onChange={changeFilter}
            onOpenWishlist={() => navigation.navigate(SCREENS.Wishlist)}
          />
        )}
        {live.status === 'denied' || live.status === 'unavailable' ? (
          <View style={searchColumn}>
            <LocationNotice
              kind={live.status}
              onTryAgain={() => void live.locate()}
              onClose={live.dismiss}
            />
          </View>
        ) : null}
      </View>
      {selectedStop && !expanded ? null : (
        <Animated.View
          style={[
            styles.bottom,
            {
              right: margin,
              bottom: compact ? TAB_CLEARANCE + space[3] : bottomChrome + space[12],
            },
            buttonsShift,
          ]}
          pointerEvents="box-none"
        >
          <MapButtons onLocate={() => void live.locate()} locating={live.status === 'locating'} />
          {compact ? <Fab onPress={() => navigation.navigate(SCREENS.MemoryForm)} /> : null}
        </Animated.View>
      )}
      {onThisDay && !onThisDayClosed && !search.active && !(selectedStop && !expanded) ? (
        <View
          style={[
            styles.onThisDay,
            {
              left: margin,
              right: compact ? margin + sizes.fab + space[3] : undefined,
              width: compact ? undefined : ON_THIS_DAY_MAX_WIDTH,
              bottom: bottomChrome + space[12],
            },
          ]}
          pointerEvents="box-none"
        >
          <OnThisDayCard
            title={onThisDay.title}
            journeyTitle={onThisDay.journeyTitle}
            visitedAt={onThisDay.visitedAt}
            coverThumbnailPath={onThisDay.coverThumbnailPath}
            onPress={() => pickMemory(onThisDay)}
            onClose={() => setOnThisDayClosed(true)}
          />
        </View>
      ) : null}
      {expanded ? null : (
        <MapSheet
          // A closed sheet keeps its old closed position when the window height changes (rotation, fold,
          // split screen) and peeks out empty; a fresh sheet starts open or closed correctly.
          key={`${width}x${height}`}
          stop={selectedStop}
          bottomInset={compact ? TAB_CLEARANCE + space[2] : space[4]}
          onClose={() => dispatch(setSelectedStopId(null))}
          onOpenMemory={openMemory}
        />
      )}
    </>
  );

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        <View style={styles.mapArea}>
          <AtlasMap
            onLoadError={handleLoadError}
            onLoaded={() => setMapLoaded(true)}
            mapRef={pins.mapRef}
            cameraRef={pins.cameraRef}
            onRegionDidChange={pins.handleRegionDidChange}
            onPress={pins.handleMapPress}
          >
            {showVisitedRegions ? <VisitedRegions regions={regions} /> : null}
            {showRoutes ? <RouteLines routes={routes} /> : null}
            <WishPins entries={wishlist} />
            <StopPins
              points={points}
              photoStops={showPhotoPins ? pins.photoStops : NO_STOPS}
              selectedId={pins.selectedId}
              sourceRef={pins.sourceRef}
              onPressStop={pins.handlePressStop}
              onPressCluster={pins.handlePressCluster}
            />
            {live.position ? (
              <UserLocationPin
                latitude={live.position.latitude}
                longitude={live.position.longitude}
              />
            ) : null}
          </AtlasMap>
          {loadFailed ? (
            <View style={styles.overlay} pointerEvents="none">
              <EmptyState
                title="The map needs a connection once"
                message="Your memories are safe on this phone. Connect and reopen the map."
              />
            </View>
          ) : null}
          {isEmpty && !loadFailed ? (
            <View style={styles.overlay} pointerEvents="none">
              <EmptyState
                title="No journeys yet — your map is waiting"
                message="Add your first memory and it lands here as an amber pin."
              />
            </View>
          ) : null}
          {chrome}
        </View>
        {expanded ? (
          <MapPanel
            stop={selectedStop}
            progress={panelProgress}
            onOpenMemory={openMemory}
            onOpenJourney={(journeyId) => navigation.navigate(SCREENS.JourneyDetail, { journeyId })}
          />
        ) : null}
      </View>
    </Screen>
  );
};
