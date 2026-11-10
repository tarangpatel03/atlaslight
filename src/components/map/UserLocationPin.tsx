import type { ReactNode } from 'react';
import { Marker } from '@maplibre/maplibre-react-native';
import { MapPin } from './MapPin';

interface UserLocationPinProps {
  latitude: number;
  longitude: number;
}

/** The aurora pulse where you are. Not pressable, so taps go through to the map. */
export const UserLocationPin = ({ latitude, longitude }: UserLocationPinProps): ReactNode => (
  <Marker id="user-location" lngLat={[longitude, latitude]}>
    <MapPin variant="live" />
  </Marker>
);
