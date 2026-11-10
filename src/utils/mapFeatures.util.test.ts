import {
  type MapStop,
  filterMapStops,
  journeyRoutes,
  routeSlice,
  stopsBounds,
  stopsToPoints,
} from './mapFeatures.util';

const stop = (overrides: Partial<MapStop> & Pick<MapStop, 'id'>): MapStop => ({
  journeyId: 'j1',
  latitude: 10,
  longitude: 20,
  title: 'Somewhere',
  visitedAt: 1,
  orderIndex: 0,
  color: '#f5b544',
  coverThumbnailPath: null,
  ...overrides,
});

describe('stopsToPoints', () => {
  it('writes [longitude, latitude] and the pin properties', () => {
    const { features } = stopsToPoints([
      stop({
        id: 'a',
        latitude: 34.15,
        longitude: 77.57,
        title: 'Leh',
        coverThumbnailPath: 'thumbs/a.jpg',
      }),
    ]);
    expect(features).toHaveLength(1);
    expect(features[0].geometry.coordinates).toEqual([77.57, 34.15]);
    expect(features[0].properties).toEqual({
      id: 'a',
      journeyId: 'j1',
      title: 'Leh',
      color: '#f5b544',
      visitedAt: 1,
      coverThumbnailPath: 'thumbs/a.jpg',
    });
  });

  it('is empty for no stops', () => {
    expect(stopsToPoints([]).features).toEqual([]);
  });
});

describe('journeyRoutes', () => {
  it('orders each journey by orderIndex', () => {
    const { features } = journeyRoutes([
      stop({ id: 'c', orderIndex: 2, longitude: 3, latitude: 3 }),
      stop({ id: 'a', orderIndex: 0, longitude: 1, latitude: 1 }),
      stop({ id: 'b', orderIndex: 1, longitude: 2, latitude: 2 }),
    ]);
    expect(features[0].geometry.coordinates).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });

  it('makes one line per journey, with its colour', () => {
    const { features } = journeyRoutes([
      stop({ id: 'a', journeyId: 'j1', orderIndex: 0, color: 'red' }),
      stop({ id: 'b', journeyId: 'j2', orderIndex: 0, color: 'blue' }),
      stop({ id: 'c', journeyId: 'j1', orderIndex: 1, color: 'red' }),
      stop({ id: 'd', journeyId: 'j2', orderIndex: 1, color: 'blue' }),
    ]);
    expect(features.map((f) => f.properties)).toEqual([
      { journeyId: 'j1', color: 'red' },
      { journeyId: 'j2', color: 'blue' },
    ]);
  });

  it('skips journeys with fewer than two stops', () => {
    expect(journeyRoutes([stop({ id: 'a' })]).features).toEqual([]);
    expect(journeyRoutes([]).features).toEqual([]);
  });

  it('does not change the input order', () => {
    const input = [stop({ id: 'b', orderIndex: 1 }), stop({ id: 'a', orderIndex: 0 })];
    journeyRoutes(input);
    expect(input.map((s) => s.id)).toEqual(['b', 'a']);
  });
});

describe('filterMapStops', () => {
  const flagged = (id: string, journeyId: string, isFavorite: boolean, isOngoing: boolean) => ({
    ...stop({ id, journeyId }),
    isFavorite,
    isOngoing,
  });
  const stops = [
    flagged('a', 'j1', false, true),
    flagged('b', 'j2', true, false),
    flagged('c', 'j2', true, false),
  ];
  const ids = (items: { id: string }[]): string[] => items.map((s) => s.id);

  it('keeps everything for all', () => {
    expect(ids(filterMapStops(stops, { kind: 'all' }))).toEqual(['a', 'b', 'c']);
  });

  it('keeps the ongoing journey', () => {
    expect(ids(filterMapStops(stops, { kind: 'ongoing' }))).toEqual(['a']);
  });

  it('keeps favourites', () => {
    expect(ids(filterMapStops(stops, { kind: 'favourites' }))).toEqual(['b', 'c']);
  });

  it('keeps one journey', () => {
    expect(ids(filterMapStops(stops, { kind: 'journey', journeyId: 'j2' }))).toEqual(['b', 'c']);
  });

  it('matches nothing for a journey that is gone', () => {
    expect(filterMapStops(stops, { kind: 'journey', journeyId: 'zzz' })).toEqual([]);
  });

  it('handles no stops', () => {
    expect(filterMapStops([], { kind: 'ongoing' })).toEqual([]);
  });
});

describe('stopsBounds', () => {
  it('is null with no stops', () => {
    expect(stopsBounds([])).toBeNull();
  });

  it('covers several stops exactly when they are far apart', () => {
    const bounds = stopsBounds([
      stop({ id: 'a', longitude: 70, latitude: 8 }),
      stop({ id: 'b', longitude: 80, latitude: 30 }),
    ]);
    expect(bounds).toEqual([70, 8, 80, 30]);
  });

  it('widens a single stop to a town-sized box around it', () => {
    const bounds = stopsBounds([stop({ id: 'a', longitude: 77, latitude: 34 })]);
    if (!bounds) throw new Error('expected bounds for one stop');
    const [west, south, east, north] = bounds;
    expect(east - west).toBeCloseTo(0.05, 6);
    expect(north - south).toBeCloseTo(0.05, 6);
    expect((west + east) / 2).toBeCloseTo(77, 6);
    expect((south + north) / 2).toBeCloseTo(34, 6);
  });
});

describe('routeSlice', () => {
  const route = [
    [0, 0],
    [0, 10],
    [0, 30],
  ];

  it('has no slice for fewer than two points', () => {
    expect(routeSlice([[0, 0]], 0.5)).toBeNull();
  });

  it('starts at the first point and ends on the last', () => {
    expect(routeSlice(route, 0)?.head).toEqual([0, 0]);
    expect(routeSlice(route, 1)).toEqual({ line: route, head: [0, 30] });
  });

  it('stops part-way inside a leg', () => {
    const slice = routeSlice(route, 0.5);
    expect(slice?.line).toHaveLength(3);
    expect(slice?.head[1]).toBeCloseTo(15, 0);
  });

  it('keeps whole legs it has passed', () => {
    const slice = routeSlice(route, 0.9);
    expect(slice?.line[1]).toEqual([0, 10]);
  });

  it('clamps the fraction and survives a zero-length route', () => {
    expect(routeSlice(route, 2)?.head).toEqual([0, 30]);
    expect(routeSlice(route, -1)?.head).toEqual([0, 0]);
    expect(
      routeSlice(
        [
          [5, 5],
          [5, 5],
        ],
        0.5,
      )?.head,
    ).toEqual([5, 5]);
  });
});
