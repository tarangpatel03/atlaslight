import type { ReactNode, Ref } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import type {
  CameraRef,
  MapProps,
  MapRef,
  StyleSpecification,
} from '@maplibre/maplibre-react-native';
import { atlaslightMapStyle } from '@/theme/mapStyle';
import type { Bounds } from '@/utils/mapFeatures.util';

interface AtlasMapProps {
  /** Layers and annotations drawn over the base style (pins, regions, routes). */
  children?: ReactNode;
  /** Called when the style or tiles fail to load (for example offline on first launch). */
  onLoadError?: () => void;
  /** Called once the style has loaded: the camera obeys moves only from then on. */
  onLoaded?: () => void;
  /** Lets the screen query rendered features and move the camera. */
  mapRef?: Ref<MapRef>;
  cameraRef?: Ref<CameraRef>;
  onRegionDidChange?: MapProps['onRegionDidChange'];
  onPress?: MapProps['onPress'];
  /** Opens framed on this box instead of the world (a journey's route map). */
  initialBounds?: Bounds;
  /** False freezes pan and zoom, so a map inside a scrolling page never steals the scroll. */
  interactive?: boolean;
}

// Whole-world view: lng, lat. Zoom 1.5 shows both hemispheres on phones and tablets.
const WORLD_CENTER: [number, number] = [20, 20];
const WORLD_ZOOM = 1.5;
const BOUNDS_PADDING = { top: 32, right: 32, bottom: 32, left: 32 };

// The style is `as const` (readonly arrays); the native map takes it as a JSON string, so the
// cast only satisfies the type and changes nothing at runtime.
const mapStyle = atlaslightMapStyle as unknown as StyleSpecification;

/**
 * The Atlaslight dark map: OpenFreeMap tiles in the custom style, no rotation or tilt.
 * The attribution button is off (owner decision).
 */
export const AtlasMap = ({
  children,
  onLoadError,
  onLoaded,
  mapRef,
  cameraRef,
  onRegionDidChange,
  onPress,
  initialBounds,
  interactive = true,
}: AtlasMapProps): ReactNode => (
  <Map
    ref={mapRef}
    style={styles.map}
    mapStyle={mapStyle}
    touchRotate={false}
    touchPitch={false}
    dragPan={interactive}
    touchZoom={interactive}
    compass={false}
    logo={false}
    attribution={false}
    onDidFailLoadingMap={onLoadError}
    onDidFinishLoadingMap={onLoaded}
    onRegionDidChange={onRegionDidChange}
    onPress={onPress}
  >
    <Camera
      ref={cameraRef}
      initialViewState={
        initialBounds
          ? { bounds: initialBounds, padding: BOUNDS_PADDING }
          : { center: WORLD_CENTER, zoom: WORLD_ZOOM }
      }
    />
    {children}
  </Map>
);

const styles = StyleSheet.create({
  map: { flex: 1 },
});
