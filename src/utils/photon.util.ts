/** A place as Photon describes it, before it is saved in the `places` table. */
export type PlaceSuggestion = {
  name: string;
  locality: string | null;
  adminArea: string | null;
  countryCode: string | null;
  countryName: string | null;
  latitude: number;
  longitude: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

const parseFeature = (feature: unknown): PlaceSuggestion | null => {
  if (!isRecord(feature) || !isRecord(feature.geometry) || !isRecord(feature.properties))
    return null;
  const coordinates = feature.geometry.coordinates;
  if (!Array.isArray(coordinates)) return null;
  const [longitude, latitude] = coordinates;
  if (typeof longitude !== 'number' || typeof latitude !== 'number') return null;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

  const props = feature.properties;
  const locality = text(props.city) ?? text(props.district) ?? text(props.county);
  const name = text(props.name) ?? text(props.street) ?? locality;
  if (!name) return null;

  return {
    name,
    locality,
    adminArea: text(props.state),
    countryCode: text(props.countrycode)?.toUpperCase() ?? null,
    countryName: text(props.country),
    latitude,
    longitude,
  };
};

/** Reads a Photon GeoJSON response. Anything unexpected is skipped, never thrown. */
export const parsePhotonResponse = (json: unknown): PlaceSuggestion[] => {
  if (!isRecord(json) || !Array.isArray(json.features)) return [];
  return json.features.flatMap((feature) => parseFeature(feature) ?? []);
};
