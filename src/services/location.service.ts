import Geolocation, { type GeolocationOptions } from '@react-native-community/geolocation';
import { cleanAltitude } from '@/utils/geo.util';
import { locationErrorKind, type LocationFailure } from '@/utils/location.util';

export type LocationPoint = { latitude: number; longitude: number };

export type LocationResult =
  ({ status: 'ok'; altitude: number | null } & LocationPoint) | { status: LocationFailure };

const FIX_TIMEOUT_MS = 10_000;
// A fix a few seconds old is fine for centring the map and saves waiting for the GPS.
const FIX_MAX_AGE_MS = 5_000;
// Metres moved before the watch reports again.
const WATCH_DISTANCE_M = 10;

const options: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: FIX_TIMEOUT_MS,
  maximumAge: FIX_MAX_AGE_MS,
};

let configured = false;

// Foreground only: no background updates, and the library may show the system permission prompt.
const configure = (): void => {
  if (configured) return;
  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    enableBackgroundLocationUpdates: false,
  });
  configured = true;
};

/** One position fix. Asks for permission the first time; never throws. */
export const getCurrentLocation = (): Promise<LocationResult> => {
  configure();
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          status: 'ok',
          latitude: coords.latitude,
          longitude: coords.longitude,
          altitude: cleanAltitude(coords.altitude),
        }),
      (error) => resolve({ status: locationErrorKind(error.code) }),
      options,
    );
  });
};

/** Reports every new position until the returned function is called. */
export const watchLocation = (
  onFix: (point: LocationPoint) => void,
  onError: (failure: LocationFailure) => void,
): (() => void) => {
  configure();
  const id = Geolocation.watchPosition(
    ({ coords }) => onFix({ latitude: coords.latitude, longitude: coords.longitude }),
    (error) => onError(locationErrorKind(error.code)),
    { ...options, distanceFilter: WATCH_DISTANCE_M },
  );
  return () => Geolocation.clearWatch(id);
};
