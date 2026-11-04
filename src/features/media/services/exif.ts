/**
 * EXIF helpers for react-native-image-crop-picker results (`includeExif: true`).
 * The two platforms return different shapes:
 * - Android: flat keys — GPSLatitude "24/1,36/1,123/100", GPSLatitudeRef "N", DateTimeOriginal "2026:06:06 23:28:10"
 * - iOS:     nested — { "{GPS}": { Latitude: 24.6, LatitudeRef: "N" }, "{Exif}": { DateTimeOriginal: "..." } }
 * Pure functions, unit-tested in exif.test.ts.
 */

export type Exif = Record<string, unknown> | null | undefined;

export type GeoPoint = { latitude: number; longitude: number };

/** "24/1,36/1,123/100" (deg, min, sec as rationals) → decimal degrees. Also accepts plain numbers. */
export function parseDms(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;

  const parts = value.split(',').map(part => {
    const [num, den] = part.trim().split('/').map(Number);
    if (!Number.isFinite(num)) return NaN;
    return den === undefined ? num : den === 0 ? NaN : num / den;
  });
  if (parts.some(Number.isNaN)) return null;

  const [deg = 0, min = 0, sec = 0] = parts;
  return deg + min / 60 + sec / 3600;
}

function applyRef(value: number, ref: unknown, negativeRef: 'S' | 'W'): number {
  return typeof ref === 'string' && ref.trim().toUpperCase() === negativeRef ? -Math.abs(value) : value;
}

function isValidPoint(lat: number, lng: number): boolean {
  // 0,0 is what many cameras write when GPS was off.
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
}

export function extractGps(exif: Exif): GeoPoint | null {
  if (!exif) return null;

  // iOS
  const gps = exif['{GPS}'] as Record<string, unknown> | undefined;
  if (gps && gps.Latitude !== undefined && gps.Longitude !== undefined) {
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
}

/**
 * EXIF "YYYY:MM:DD HH:MM:SS" → epoch ms, read as device-local time
 * (EXIF has no time zone; the photo was almost always taken in the zone it's viewed in).
 */
export function parseExifDate(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number);
  const date = new Date(y, mo - 1, d, h, mi, s);
  return Number.isNaN(date.getTime()) || y < 1990 ? null : date.getTime();
}

export function extractTakenAt(exif: Exif): number | null {
  if (!exif) return null;
  const ios = exif['{Exif}'] as Record<string, unknown> | undefined;
  return (
    parseExifDate(ios?.DateTimeOriginal) ??
    parseExifDate(exif.DateTimeOriginal) ??
    parseExifDate(exif.DateTime) ??
    null
  );
}
