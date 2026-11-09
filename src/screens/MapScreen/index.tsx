import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useGetMapStopsQuery } from '@/api/map.api';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { AtlasMap, StopPins } from '@/components/map';
import { useMapPins } from '@/hooks/useMapPins';
import { useWindowClass } from '@/hooks/useWindowClass';
import { useAppSelector } from '@/store/hooks';
import { selectMapFilter } from '@/store/slices';
import { filterMapStops, stopsToPoints } from '@/utils/mapFeatures.util';
import { showToast } from '@/utils/toast.util';
import { styles } from './style';

/** Home tab: the world map with a pin for every memory. Regions and routes arrive in the next checkpoints. */
export const MapScreen = (): ReactNode => {
  const { bottomChrome } = useWindowClass();
  const { data, isError } = useGetMapStopsQuery();
  const filter = useAppSelector(selectMapFilter);
  const [loadFailed, setLoadFailed] = useState(false);

  const stops = useMemo(() => filterMapStops(data ?? [], filter), [data, filter]);
  const points = useMemo(() => stopsToPoints(stops), [stops]);
  const pins = useMapPins(stops);

  useEffect(() => {
    if (isError) showToast.error('Could not load your memories', 'Reopen the map to try again.');
  }, [isError]);

  const handleLoadError = (): void => {
    setLoadFailed(true);
    showToast.error('Map did not load', 'Check your connection and reopen the map.');
  };

  const isEmpty = data !== undefined && data.length === 0;

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        <AtlasMap
          onLoadError={handleLoadError}
          bottomInset={bottomChrome}
          mapRef={pins.mapRef}
          cameraRef={pins.cameraRef}
          onRegionDidChange={pins.handleRegionDidChange}
          onPress={pins.handleMapPress}
        >
          <StopPins
            points={points}
            photoStops={pins.photoStops}
            selectedId={pins.selectedId}
            sourceRef={pins.sourceRef}
            onPressStop={pins.handlePressStop}
            onPressCluster={pins.handlePressCluster}
          />
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
      </View>
    </Screen>
  );
};
