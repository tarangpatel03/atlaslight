import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

import countriesJson from './countries.json';
import indiaStatesJson from './indiaStates.json';

export type CountryProps = { iso2: string; name: string };
export type StateProps = { name: string };
export type RegionShape = Polygon | MultiPolygon;

// Bundled so regions work offline. Natural Earth 1:50m countries and 1:10m India admin-1,
// reduced and simplified at build time (see README, "Map data").
// The JSON imports are typed structurally by TypeScript; the files hold exactly these properties.
export const countries = countriesJson as unknown as FeatureCollection<RegionShape, CountryProps>;
export const indiaStates = indiaStatesJson as unknown as FeatureCollection<RegionShape, StateProps>;
