import type { Feature, MultiPolygon, Polygon } from 'geojson';

import type { RegionData } from './region.util';
import {
  buildScratchPaths,
  fitProjection,
  ringToPath,
  scratchMapHeight,
  shapeToPath,
} from './scratchMap.util';

const square = (west: number, south: number, east: number, north: number): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ],
  ],
});

const country = (
  iso2: string,
  name: string,
  geometry: Polygon,
): Feature<Polygon, { iso2: string; name: string }> => ({
  type: 'Feature',
  properties: { iso2, name },
  geometry,
});

// A toy world: India (two states) and "Siachen" (also IN), France, and Antarctica.
const toy: RegionData = {
  countries: {
    type: 'FeatureCollection',
    features: [
      country('IN', 'India', square(0, 0, 10, 10)),
      country('IN', 'Siachen Glacier', square(12, 0, 14, 4)),
      country('FR', 'France', square(20, 0, 30, 10)),
      country('AQ', 'Antarctica', square(-50, -56, 50, -50)),
    ],
  },
  states: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { name: 'Goa' }, geometry: square(0, 0, 5, 10) },
      { type: 'Feature', properties: { name: 'Kerala' }, geometry: square(5, 0, 10, 10) },
    ],
  },
};

const pathCount = (path: string): number => path.match(/M/g)?.length ?? 0;
const none = { countryCodes: [], states: [] };

describe('fitProjection', () => {
  const bounds: [number, number, number, number] = [0, 0, 10, 10];

  it('keeps the proportions of the area and stays inside the box', () => {
    const project = fitProjection(bounds, { width: 200, height: 100 });
    const [x0, y0] = project([0, 10]);
    const [x1, y1] = project([10, 0]);
    // Longitude degrees are shorter than latitude degrees by cos(5°).
    expect((x1 - x0) / (y1 - y0)).toBeCloseTo(Math.cos((5 * Math.PI) / 180), 6);
    expect(Math.min(x0, x1, y0, y1)).toBeGreaterThanOrEqual(0);
    expect(Math.max(x0, x1)).toBeLessThanOrEqual(200);
    expect(Math.max(y0, y1)).toBeLessThanOrEqual(100);
  });

  it('centres the area in the box', () => {
    const [x, y] = fitProjection(bounds, { width: 400, height: 100 })([5, 5]);
    expect(x).toBeCloseTo(200, 6);
    expect(y).toBeCloseTo(50, 6);
  });

  it('keeps the padding free', () => {
    const project = fitProjection(bounds, { width: 100, height: 100 }, 10);
    const [x, y] = project([0, 10]);
    expect(Math.min(x, y)).toBeGreaterThanOrEqual(10 - 1e-9);
  });

  it('puts north at the top', () => {
    const project = fitProjection(bounds, { width: 100, height: 100 });
    expect(project([5, 10])[1]).toBeLessThan(project([5, 0])[1]);
  });
});

describe('ringToPath', () => {
  const grow = ([x, y]: number[]): [number, number] => [x * 10, y * 10];

  it('writes a closed path without repeating the first vertex', () => {
    const ring = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ];
    expect(ringToPath(ring, grow)).toBe('M0 0L10 0L10 10L0 10Z');
  });

  it('drops vertices that sit next to the last kept one', () => {
    const ring = [
      [0, 0],
      [0.01, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ];
    expect(ringToPath(ring, grow)).toBe('M0 0L10 0L10 10L0 10Z');
  });

  it('drops a ring with fewer than three points left', () => {
    expect(
      ringToPath(
        [
          [0, 0],
          [1, 0],
        ],
        grow,
      ),
    ).toBe('');
  });

  it('drops a speck smaller than a pixel', () => {
    const speck = [
      [0, 0],
      [0.08, 0],
      [0.08, 0.08],
      [0, 0.08],
      [0, 0],
    ];
    expect(ringToPath(speck, grow)).toBe('');
  });
});

describe('shapeToPath', () => {
  const grow = ([x, y]: number[]): [number, number] => [x * 10, y * 10];

  it('keeps a hole as its own ring', () => {
    const withHole: Polygon = {
      type: 'Polygon',
      coordinates: [...square(0, 0, 5, 5).coordinates, ...square(1, 1, 2, 2).coordinates],
    };
    expect(pathCount(shapeToPath(withHole, grow))).toBe(2);
  });

  it('draws every polygon of a MultiPolygon', () => {
    const islands: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [square(0, 0, 2, 2).coordinates, square(5, 5, 7, 7).coordinates],
    };
    expect(pathCount(shapeToPath(islands, grow))).toBe(2);
  });
});

describe('buildScratchPaths', () => {
  const size = { width: 720, height: 300 };

  it('fills every country with a visited code, even when several shapes share it', () => {
    const paths = buildScratchPaths({ countryCodes: ['IN'], states: [] }, size, toy);
    expect(pathCount(paths.visited)).toBe(2);
    expect(pathCount(paths.land)).toBe(1);
  });

  it('leaves Antarctica out', () => {
    const paths = buildScratchPaths({ countryCodes: ['AQ'], states: [] }, size, toy);
    expect(paths.visited).toBe('');
    expect(pathCount(paths.land)).toBe(3);
  });

  it('is empty without a box to draw in', () => {
    expect(buildScratchPaths(none, { width: 0, height: 0 }, toy)).toEqual({
      land: '',
      visited: '',
    });
  });

  it('ignores states', () => {
    const paths = buildScratchPaths({ countryCodes: [], states: ['Goa'] }, size, toy);
    expect(paths.visited).toBe('');
  });
});

describe('scratchMapHeight', () => {
  it('sizes the world to its shape, wider windows giving taller maps', () => {
    const narrow = scratchMapHeight(358);
    expect(narrow).toBeGreaterThan(120);
    expect(narrow).toBeLessThan(200);
    expect(scratchMapHeight(716)).toBeGreaterThan(narrow);
  });

  it('keeps the world close to the shape fitProjection draws', () => {
    const width = 400;
    const height = scratchMapHeight(width);
    // The height is rounded to whole dp, so the drawing may sit up to about a dp inside the padding.
    const project = fitProjection([-180, -58, 180, 84], { width, height }, 8);
    expect(Math.abs(project([-180, 84])[0] - 8)).toBeLessThan(1.5);
    expect(Math.abs(project([180, -58])[1] - (height - 8))).toBeLessThan(1.5);
  });
});
