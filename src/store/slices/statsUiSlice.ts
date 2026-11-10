import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { StatsFilter } from '@/utils/stats.util';

interface StatsUiState {
  filter: StatsFilter;
}

const initialState: StatsUiState = { filter: 'all' };

/** Which year the Stats screen shows ('all' = all time). Not persisted. */
const statsUiSlice = createSlice({
  name: 'statsUi',
  initialState,
  reducers: {
    setStatsFilter: (state, action: PayloadAction<StatsFilter>) => {
      state.filter = action.payload;
    },
  },
});

export const { setStatsFilter } = statsUiSlice.actions;
export const statsUiReducer = statsUiSlice.reducer;
export const selectStatsFilter = (state: RootState): StatsFilter => state.statsUi.filter;
