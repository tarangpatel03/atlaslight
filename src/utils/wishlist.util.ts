type PlaceParts = {
  name: string;
  locality: string | null;
  adminArea: string | null;
  countryName: string | null;
};

/** "Locality, State, Country" under a place's name; parts equal to the name or missing are left out. */
export const placeSubtitle = (place: PlaceParts): string =>
  [place.locality, place.adminArea, place.countryName]
    .filter((part): part is string => part !== null && part !== place.name)
    .join(', ');
