/** Why a location request failed, as the Map explains it to the user. */
export type LocationFailure = 'denied' | 'unavailable';

// The geolocation library follows the web spec: 1 = permission denied, 2 = position unavailable, 3 = timeout.
const PERMISSION_DENIED = 1;

/** Denied is something the user can fix in Settings; everything else (no fix, location off, timeout) is "unavailable". */
export const locationErrorKind = (code: number): LocationFailure =>
  code === PERMISSION_DENIED ? 'denied' : 'unavailable';
