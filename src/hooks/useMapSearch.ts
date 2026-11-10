import { useState } from 'react';
import { useSearchPlacesQuery } from '@/api/places.api';
import type { MapStopItem } from '@/api/map.api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { searchLocal, type LocalSearchResults } from '@/utils/mapSearch.util';
import type { PlaceSuggestion } from '@/utils/photon.util';

/** Photon fair use: wait for the user to stop typing before searching. */
const SEARCH_DELAY_MS = 400;
const MIN_PLACE_QUERY_LENGTH = 3;

export type MapSearchController = {
  text: string;
  setText: (text: string) => void;
  clear: () => void;
  /** The search list is open: there is text to look for. */
  active: boolean;
  local: LocalSearchResults<MapStopItem>;
  places: PlaceSuggestion[];
  placesLoading: boolean;
  placesFailed: boolean;
};

/** Map search: your memories and journeys first (instant), then Photon places (debounced). */
export const useMapSearch = (stops: MapStopItem[]): MapSearchController => {
  const [text, setText] = useState('');
  const query = useDebouncedValue(text.trim(), SEARCH_DELAY_MS);
  const searchingPlaces = query.length >= MIN_PLACE_QUERY_LENGTH;
  const { data, isFetching, isError } = useSearchPlacesQuery(query, { skip: !searchingPlaces });

  return {
    text,
    setText,
    clear: () => setText(''),
    active: text.trim().length > 0,
    local: searchLocal(stops, text),
    places: searchingPlaces ? (data ?? []) : [],
    // Also true while the debounce is still waiting, so "no places" never flashes mid-typing.
    placesLoading:
      text.trim().length >= MIN_PLACE_QUERY_LENGTH && (query !== text.trim() || isFetching),
    placesFailed: searchingPlaces && isError,
  };
};
