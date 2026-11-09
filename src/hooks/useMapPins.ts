import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import type {
  CameraRef,
  GeoJSONSourceRef,
  MapRef,
  ViewStateChangeEvent,
} from '@maplibre/maplibre-react-native';
import type { MapStopItem } from '@/api/map.api';
import { STOP_LAYERS } from '@/components/map';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSelectedStopId, setSelectedStopId } from '@/store/slices';
import { mapPins } from '@/theme/mapPins';

// Wait for the camera to settle before asking the map what is in view.
const SETTLE_MS = 200;

export type MapPinsController = {
  mapRef: RefObject<MapRef | null>;
  cameraRef: RefObject<CameraRef | null>;
  sourceRef: RefObject<GeoJSONSourceRef | null>;
  selectedId: string | null;
  /** Memories to draw as photo pins: the unclustered ones in view that have a cover. */
  photoStops: MapStopItem[];
  handleRegionDidChange: (event: NativeSyntheticEvent<ViewStateChangeEvent>) => void;
  handlePressStop: (stopId: string) => void;
  handlePressCluster: (clusterId: number, lngLat: [number, number]) => Promise<void>;
  handleMapPress: () => void;
};

/**
 * Selection, camera moves and the photo pins of the Map screen. Takes the stops that pass the
 * current filter; the screen owns the data query.
 */
export const useMapPins = (stops: MapStopItem[]): MapPinsController => {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector(selectSelectedStopId);

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const sourceRef = useRef<GeoJSONSourceRef>(null);
  const zoomRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [photoStops, setPhotoStops] = useState<MapStopItem[]>([]);

  const refreshPhotoPins = useCallback((): void => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (zoomRef.current < mapPins.photoMinZoom) {
        setPhotoStops([]);
        return;
      }
      // Dots are the unclustered memories; the ones in view get a photo when they have one.
      const features = await mapRef.current?.queryRenderedFeatures({ layers: [STOP_LAYERS.dots] });
      const inView = new Set((features ?? []).map((feature) => feature.properties?.id));
      setPhotoStops(
        stops
          .filter((stop) => stop.coverThumbnailPath && inView.has(stop.id))
          .slice(0, mapPins.photoMaxCount),
      );
    }, SETTLE_MS);
  }, [stops]);

  // The data or filter changed: look again at what is in view.
  useEffect(() => {
    refreshPhotoPins();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [refreshPhotoPins]);

  // A deleted memory, or one the filter hides, must not stay selected.
  useEffect(() => {
    if (selectedId && !stops.some((stop) => stop.id === selectedId)) {
      dispatch(setSelectedStopId(null));
    }
  }, [dispatch, selectedId, stops]);

  const handleRegionDidChange = (event: NativeSyntheticEvent<ViewStateChangeEvent>): void => {
    zoomRef.current = event.nativeEvent.zoom;
    refreshPhotoPins();
  };

  const handlePressStop = (stopId: string): void => {
    dispatch(setSelectedStopId(stopId));
    const stop = stops.find((item) => item.id === stopId);
    if (stop) cameraRef.current?.easeTo({ center: [stop.longitude, stop.latitude], duration: 400 });
  };

  const handlePressCluster = async (clusterId: number, lngLat: [number, number]): Promise<void> => {
    const zoom = await sourceRef.current?.getClusterExpansionZoom(clusterId);
    if (zoom === undefined) return;
    cameraRef.current?.easeTo({ center: lngLat, zoom, duration: 500 });
  };

  // A press on empty map: nothing is selected any more.
  const handleMapPress = (): void => {
    dispatch(setSelectedStopId(null));
  };

  return {
    mapRef,
    cameraRef,
    sourceRef,
    selectedId,
    photoStops,
    handleRegionDidChange,
    handlePressStop,
    handlePressCluster,
    handleMapPress,
  };
};
