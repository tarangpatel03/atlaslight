import { formatDistance, kmToMiles, routeDistanceKm } from './geo.util';

const delhi = { latitude: 28.6139, longitude: 77.209 };
const mumbai = { latitude: 19.076, longitude: 72.8777 };
const goa = { latitude: 15.2993, longitude: 74.124 };

describe('routeDistanceKm', () => {
  it('is 0 for fewer than two points', () => {
    expect(routeDistanceKm([])).toBe(0);
    expect(routeDistanceKm([delhi])).toBe(0);
  });

  it('measures Delhi to Mumbai at about 1,150 km', () => {
    expect(routeDistanceKm([delhi, mumbai])).toBeGreaterThan(1130);
    expect(routeDistanceKm([delhi, mumbai])).toBeLessThan(1170);
  });

  it('adds the legs in route order', () => {
    const legs = routeDistanceKm([delhi, mumbai]) + routeDistanceKm([mumbai, goa]);
    expect(routeDistanceKm([delhi, mumbai, goa])).toBeCloseTo(legs, 6);
  });
});

describe('kmToMiles', () => {
  it('converts', () => {
    expect(kmToMiles(1.609344)).toBeCloseTo(1, 6);
  });
});

describe('formatDistance', () => {
  it('uses whole numbers and a thousands separator from 100 up', () => {
    expect(formatDistance(1240.4, 'km')).toBe('1,240 km');
  });

  it('keeps one decimal below 100', () => {
    expect(formatDistance(42.37, 'km')).toBe('42.4 km');
  });

  it('switches to miles', () => {
    expect(formatDistance(1240, 'mi')).toBe('771 mi');
  });
});
