/**
 * EXIF helpers for react-native-image-crop-picker results (`includeExif: true`).
 * The two platforms return different shapes:
 * - Android: flat keys — GPSLatitude "24/1,36/1,123/100", GPSLatitudeRef "N", DateTimeOriginal "2026:06:06 23:28:10"
 * - iOS:     nested — { "{GPS}": { Latitude: 24.6, LatitudeRef: "N" }, "{Exif}": { DateTimeOriginal: "..." } }
 * Pure functions, unit-tested in exif.util.test.ts.
 */

import { cleanAltitude } from '@/utils/geo.util';

export type Exif = Record<string, unknown> | null | undefined;

export type GeoPoint = { latitude: number; longitude: number };

/** "24/1,36/1,123/100" (deg, min, sec as rationals) → decimal degrees. Also accepts plain numbers. */
export const parseDms = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;

  const parts = value.split(',').map((part) => {
    const [num, den] = part.trim().split('/').map(Number);
    if (!Number.isFinite(num)) return NaN;
    return den === undefined ? num : den === 0 ? NaN : num / den;
  });
  if (parts.some(Number.isNaN)) return null;

  const [deg = 0, min = 0, sec = 0] = parts;
  return deg + min / 60 + sec / 3600;
};

const applyRef = (value: number, ref: unknown, negativeRef: 'S' | 'W'): number =>
  typeof ref === 'string' && ref.trim().toUpperCase() === negativeRef ? -Math.abs(value) : value;

// 0,0 is what many cameras write when GPS was off.
const isValidPoint = (lat: number, lng: number): boolean =>
  Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** GPS position from EXIF (iOS nested or Android flat keys), or null when missing or invalid. */
export const extractGps = (exif: Exif): GeoPoint | null => {
  if (!exif) return null;

  // iOS
  const gps = exif['{GPS}'];
  if (isRecord(gps) && gps.Latitude !== undefined && gps.Longitude !== undefined) {
    const lat = applyRef(Number(gps.Latitude), gps.LatitudeRef, 'S');
    const lng = applyRef(Number(gps.Longitude), gps.LongitudeRef, 'W');
    return isValidPoint(lat, lng) ? { latitude: lat, longitude: lng } : null;
  }

  // Android
  const rawLat = parseDms(exif.GPSLatitude);
  const rawLng = parseDms(exif.GPSLongitude);
  if (rawLat === null || rawLng === null) return null;
  const lat = applyRef(rawLat, exif.GPSLatitudeRef, 'S');
  const lng = applyRef(rawLng, exif.GPSLongitudeRef, 'W');
  return isValidPoint(lat, lng) ? { latitude: lat, longitude: lng } : null;
};

// Ref 1 = below sea level; the picker may hand it over as a number or a string.
const isBelowSeaLevel = (ref: unknown): boolean => Number(ref) === 1;

/** Height above sea level in whole metres from EXIF (iOS nested or Android flat keys), or null when missing. */
export const extractAltitude = (exif: Exif): number | null => {
  if (!exif) return null;

  // iOS
  const gps = exif['{GPS}'];
  if (isRecord(gps) && gps.Altitude !== undefined) {
    const value = Number(gps.Altitude);
    return cleanAltitude(isBelowSeaLevel(gps.AltitudeRef) ? -Math.abs(value) : value);
  }

  // Android: a rational such as "5359/1"
  const raw = parseDms(exif.GPSAltitude);
  if (raw === null) return null;
  return cleanAltitude(isBelowSeaLevel(exif.GPSAltitudeRef) ? -Math.abs(raw) : raw);
};

/**
 * EXIF "YYYY:MM:DD HH:MM:SS" → epoch ms, read as device-local time
 * (EXIF has no time zone; the photo was almost always taken in the zone it's viewed in).
 */
export const parseExifDate = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number);
  const date = new Date(y, mo - 1, d, h, mi, s);
  return Number.isNaN(date.getTime()) || y < 1990 ? null : date.getTime();
};

/** Capture time from EXIF in epoch ms, or null when missing. */
export const extractTakenAt = (exif: Exif): number | null => {
  if (!exif) return null;
  const ios = exif['{Exif}'];
  return (
    parseExifDate(isRecord(ios) ? ios.DateTimeOriginal : undefined) ??
    parseExifDate(exif.DateTimeOriginal) ??
    parseExifDate(exif.DateTime) ??
    null
  );
};
