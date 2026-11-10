import { extractAltitude, extractGps, extractTakenAt, parseDms, parseExifDate } from './exif.util';

describe('parseDms', () => {
  it('converts Android rational DMS to decimal degrees', () => {
    expect(parseDms('24/1,36/1,180/100')).toBeCloseTo(24.6005, 4);
  });

  it('accepts plain numbers', () => {
    expect(parseDms(73.6767)).toBe(73.6767);
  });

  it('rejects malformed input', () => {
    expect(parseDms('abc')).toBeNull();
    expect(parseDms('24/0,1/1,1/1')).toBeNull();
    expect(parseDms('')).toBeNull();
    expect(parseDms(undefined)).toBeNull();
  });
});

describe('extractGps', () => {
  it('reads the Android flat shape', () => {
    const gps = extractGps({
      GPSLatitude: '32/1,17/1,5136/100',
      GPSLatitudeRef: 'N',
      GPSLongitude: '78/1,0/1,4284/100',
      GPSLongitudeRef: 'E',
    });
    expect(gps?.latitude).toBeCloseTo(32.2976, 3);
    expect(gps?.longitude).toBeCloseTo(78.0119, 3);
  });

  it('reads the iOS nested shape', () => {
    expect(extractGps({ '{GPS}': { Latitude: 24.6, LatitudeRef: 'N', Longitude: 73.68, LongitudeRef: 'E' } })).toEqual({
      latitude: 24.6,
      longitude: 73.68,
    });
  });

  it('applies S and W references as negative', () => {
    expect(extractGps({ '{GPS}': { Latitude: 33.86, LatitudeRef: 'S', Longitude: 151.2, LongitudeRef: 'W' } })).toEqual({
      latitude: -33.86,
      longitude: -151.2,
    });
  });

  it('treats 0,0 and missing data as no location', () => {
    expect(extractGps({ GPSLatitude: '0/1,0/1,0/1', GPSLongitude: '0/1,0/1,0/1' })).toBeNull();
    expect(extractGps({})).toBeNull();
    expect(extractGps(null)).toBeNull();
  });
});

describe('parseExifDate / extractTakenAt', () => {
  it('parses EXIF timestamps as local time', () => {
    expect(parseExifDate('2026:06:06 23:28:10')).toBe(new Date(2026, 5, 6, 23, 28, 10).getTime());
  });

  it('rejects junk and placeholder dates', () => {
    expect(parseExifDate('0000:00:00 00:00:00')).toBeNull();
    expect(parseExifDate('yesterday')).toBeNull();
  });

  it('prefers DateTimeOriginal, iOS first, then falls back to DateTime', () => {
    const original = new Date(2026, 2, 13, 6, 12, 0).getTime();
    expect(extractTakenAt({ '{Exif}': { DateTimeOriginal: '2026:03:13 06:12:00' } })).toBe(original);
    expect(extractTakenAt({ DateTimeOriginal: '2026:03:13 06:12:00', DateTime: '2026:03:14 10:00:00' })).toBe(original);
    expect(extractTakenAt({ DateTime: '2026:03:13 06:12:00' })).toBe(original);
    expect(extractTakenAt(undefined)).toBeNull();
  });
});

describe('extractAltitude', () => {
  it('reads the Android rational', () => {
    expect(extractAltitude({ GPSAltitude: '5359/1', GPSAltitudeRef: '0' })).toBe(5359);
    expect(extractAltitude({ GPSAltitude: '43210/10' })).toBe(4321);
  });

  it('reads the iOS nested shape', () => {
    expect(extractAltitude({ '{GPS}': { Altitude: 2960.4, AltitudeRef: 0 } })).toBe(2960);
  });

  it('makes a below-sea-level reference negative, as a number or a string', () => {
    expect(extractAltitude({ GPSAltitude: '420/1', GPSAltitudeRef: '1' })).toBe(-420);
    expect(extractAltitude({ '{GPS}': { Altitude: 12, AltitudeRef: 1 } })).toBe(-12);
  });

  it('accepts sea level', () => {
    expect(extractAltitude({ GPSAltitude: '0/1' })).toBe(0);
  });

  it('returns null for missing, junk or impossible heights', () => {
    expect(extractAltitude({})).toBeNull();
    expect(extractAltitude(null)).toBeNull();
    expect(extractAltitude({ GPSAltitude: 'abc' })).toBeNull();
    expect(extractAltitude({ GPSAltitude: '20000/1' })).toBeNull();
  });
});
