import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { MapFilter } from '@/utils/mapFeatures.util';

interface MapUiState {
  filter: MapFilter;
  /** The memory shown in the phone sheet or the tablet side panel; null when none is picked. */
  selectedStopId: string | null;
}

const initialState: MapUiState = { filter: { kind: 'all' }, selectedStopId: null };

/** Which chip the Map is filtered to and which pin is selected. Not persisted; the camera stays in MapLibre. */
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
  },
});

export const { setMapFilter, setSelectedStopId } = mapUiSlice.actions;
export const mapUiReducer = mapUiSlice.reducer;
export const selectMapFilter = (state: RootState): MapFilter => state.mapUi.filter;
export const selectSelectedStopId = (state: RootState): string | null => state.mapUi.selectedStopId;
