import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { MapFilter } from '@/utils/mapFeatures.util';

/** Live location: off until the user taps Locate; denied and unavailable show a notice on the Map. */
export type LocationStatus = 'off' | 'locating' | 'on' | 'denied' | 'unavailable';

export type UserPosition = { latitude: number; longitude: number };

interface MapUiState {
  filter: MapFilter;
  /** The memory shown in the phone sheet or the tablet side panel; null when none is picked. */
  selectedStopId: string | null;
  locationStatus: LocationStatus;
  /** Where the user is while live location is on; null otherwise. */
  userPosition: UserPosition | null;
}

const initialState: MapUiState = {
  filter: { kind: 'all' },
  selectedStopId: null,
  locationStatus: 'off',
  userPosition: null,
};

/** Which chip the Map is filtered to, which pin is selected and live location. Not persisted; the camera stays in MapLibre. */
const mapUiSlice = createSlice({
  name: 'mapUi',
  initialState,
  reducers: {
    setMapFilter: (state, action: PayloadAction<MapFilter>) => {
      state.filter = action.payload;
      // The selected pin may be hidden by the new filter.
      state.selectedStopId = null;
    },
    setSelectedStopId: (state, action: PayloadAction<string | null>) => {
      state.selectedStopId = action.payload;
    },
    setLocationStatus: (state, action: PayloadAction<LocationStatus>) => {
      state.locationStatus = action.payload;
      // No pin once live location is not on.
      if (action.payload !== 'on') state.userPosition = null;
    },
    setUserPosition: (state, action: PayloadAction<UserPosition>) => {
      state.userPosition = action.payload;
    },
  },
});

export const { setMapFilter, setSelectedStopId, setLocationStatus, setUserPosition } =
  mapUiSlice.actions;
export const mapUiReducer = mapUiSlice.reducer;
export const selectMapFilter = (state: RootState): MapFilter => state.mapUi.filter;
export const selectSelectedStopId = (state: RootState): string | null => state.mapUi.selectedStopId;
export const selectLocationStatus = (state: RootState): LocationStatus =>
  state.mapUi.locationStatus;
export const selectUserPosition = (state: RootState): UserPosition | null =>
  state.mapUi.userPosition;
