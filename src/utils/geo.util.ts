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
