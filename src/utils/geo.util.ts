import distance from '@turf/distance';

export type LatLng = { latitude: number; longitude: number };

export type DistanceUnit = 'km' | 'mi';

const KM_PER_MILE = 1.609344;

/** Great-circle length of a route in km, summed leg by leg in route order. */
export const routeDistanceKm = (points: LatLng[]): number => {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distance(
      [points[i - 1].longitude, points[i - 1].latitude],
      [points[i].longitude, points[i].latitude],
      { units: 'kilometers' },
    );
  }
  return total;
};

/** Heights outside this range (metres) are sensor noise, not places a person stood. */
export const MIN_ALTITUDE_M = -500;
export const MAX_ALTITUDE_M = 9000;

/** A GPS or EXIF height as whole metres, or null when it is missing or not believable. */
export const cleanAltitude = (value: number | null | undefined): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const metres = Math.round(value);
  return metres < MIN_ALTITUDE_M || metres > MAX_ALTITUDE_M ? null : metres;
};

export const kmToMiles = (km: number): number => km / KM_PER_MILE;

/** `1,240 km` or `770 mi`; whole numbers from 100 up, one decimal below. */
export const formatDistance = (km: number, unit: DistanceUnit): string => {
  const value = unit === 'mi' ? kmToMiles(km) : km;
  const text = value.toLocaleString('en-US', {
    minimumFractionDigits: value >= 100 ? 0 : 1,
    maximumFractionDigits: value >= 100 ? 0 : 1,
  });
  return `${text} ${unit}`;
};
