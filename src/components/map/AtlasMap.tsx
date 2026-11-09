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

interface AtlasMapProps {
  /** Layers and annotations drawn over the base style (pins, regions, routes). */
  children?: ReactNode;
  /** Called when the style or tiles fail to load (for example offline on first launch). */
  onLoadError?: () => void;
  /** Space kept free at the bottom (the floating phone tab bar), so the attribution button stays visible. */
  bottomInset?: number;
  /** Lets the screen query rendered features and move the camera. */
  mapRef?: Ref<MapRef>;
  cameraRef?: Ref<CameraRef>;
  onRegionDidChange?: MapProps['onRegionDidChange'];
  onPress?: MapProps['onPress'];
}

// Whole-world view: lng, lat. Zoom 1.5 shows both hemispheres on phones and tablets.
const WORLD_CENTER: [number, number] = [20, 20];
const WORLD_ZOOM = 1.5;

// The style is `as const` (readonly arrays); the native map takes it as a JSON string, so the
// cast only satisfies the type and changes nothing at runtime.
const mapStyle = atlaslightMapStyle as unknown as StyleSpecification;

/**
 * The Atlaslight dark map: OpenFreeMap tiles in the custom style, no rotation or tilt.
 * The attribution button stays on (OpenFreeMap and OpenStreetMap require credit).
 */
export const AtlasMap = ({
  children,
  onLoadError,
  bottomInset = 0,
  mapRef,
  cameraRef,
  onRegionDidChange,
  onPress,
}: AtlasMapProps): ReactNode => (
  <Map
    ref={mapRef}
    style={styles.map}
    mapStyle={mapStyle}
    touchRotate={false}
    touchPitch={false}
    compass={false}
    logo={false}
    attribution
    attributionPosition={{ bottom: 8 + bottomInset, right: 8 }}
    onDidFailLoadingMap={onLoadError}
    onRegionDidChange={onRegionDidChange}
    onPress={onPress}
  >
    <Camera ref={cameraRef} initialViewState={{ center: WORLD_CENTER, zoom: WORLD_ZOOM }} />
    {children}
  </Map>
);

const styles = StyleSheet.create({
  map: { flex: 1 },
});
