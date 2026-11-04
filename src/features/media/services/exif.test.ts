import { extractGps, extractTakenAt, parseDms, parseExifDate } from './exif';

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
