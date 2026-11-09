import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { JourneyFilter } from '@/utils/journey.util';

interface JourneysUiState {
  filter: JourneyFilter;
  /** The journey shown in the tablet side panel; null until one is picked. */
  selectedJourneyId: string | null;
}

const initialState: JourneysUiState = { filter: 'all', selectedJourneyId: null };

/** What the Journeys list is filtered to and which journey the tablet panel shows. Not persisted. */
const journeysUiSlice = createSlice({
  name: 'journeysUi',
  initialState,
  reducers: {
    setJourneyFilter: (state, action: PayloadAction<JourneyFilter>) => {
      state.filter = action.payload;
    },
    setSelectedJourneyId: (state, action: PayloadAction<string | null>) => {
      state.selectedJourneyId = action.payload;
    },
  },
});

export const { setJourneyFilter, setSelectedJourneyId } = journeysUiSlice.actions;
export const journeysUiReducer = journeysUiSlice.reducer;
export const selectJourneyFilter = (state: RootState): JourneyFilter => state.journeysUi.filter;
export const selectSelectedJourneyId = (state: RootState): string | null =>
  state.journeysUi.selectedJourneyId;
