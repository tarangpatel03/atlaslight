import { parsePhotonResponse } from './photon.util';

const feature = (
  properties: Record<string, unknown>,
  coordinates: unknown = [78.011849, 32.29728],
): unknown => ({
  type: 'Feature',
  properties,
  geometry: { type: 'Point', coordinates },
});

describe('parsePhotonResponse', () => {
  it('reads a search hit (coordinates are lon, lat)', () => {
    const json = {
      features: [
        feature(
          {
            name: 'Gumrang Monastery',
            street: 'Manali-Leh',
            district: 'Cheling',
            city: 'Keylang',
            county: 'Lahaul',
            state: 'Himachal Pradesh',
            country: 'India',
            countrycode: 'IN',
          },
          [77.0494505, 32.57205],
        ),
      ],
    };
    expect(parsePhotonResponse(json)).toEqual([
      {
        name: 'Gumrang Monastery',
        locality: 'Keylang',
        adminArea: 'Himachal Pradesh',
        countryCode: 'IN',
        countryName: 'India',
        latitude: 32.57205,
        longitude: 77.0494505,
      },
    ]);
  });

  it('falls back from city to district to county for the locality', () => {
    const [place] = parsePhotonResponse({
      features: [feature({ name: 'Ki Gompa', county: 'Spiti' })],
    });
    expect(place.locality).toBe('Spiti');
  });

  it('names a place after its street, then its locality, when it has no name', () => {
    const [byStreet] = parsePhotonResponse({
      features: [feature({ street: 'Kaza-Kibber Road', city: 'Key' })],
    });
    expect(byStreet.name).toBe('Kaza-Kibber Road');
    const [byCity] = parsePhotonResponse({ features: [feature({ city: 'Key' })] });
    expect(byCity.name).toBe('Key');
  });

  it('upper-cases the country code and leaves missing parts null', () => {
    const [place] = parsePhotonResponse({
      features: [feature({ name: 'Somewhere', countrycode: 'in' })],
    });
    expect(place.countryCode).toBe('IN');
    expect(place.adminArea).toBeNull();
    expect(place.countryName).toBeNull();
  });

  it('skips features with no name or a broken position', () => {
    const json = {
      features: [
        feature({ osm_key: 'place' }),
        feature({ name: 'Bad' }, [1]),
        feature({ name: 'Worse' }, ['1', '2']),
        feature({ name: 'Good' }),
      ],
    };
    expect(parsePhotonResponse(json).map((p) => p.name)).toEqual(['Good']);
  });

  it('returns nothing for input that is not a feature collection', () => {
    expect(parsePhotonResponse(null)).toEqual([]);
    expect(parsePhotonResponse('oops')).toEqual([]);
    expect(parsePhotonResponse({})).toEqual([]);
    expect(parsePhotonResponse({ features: 'x' })).toEqual([]);
  });
});
