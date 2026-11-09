import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

export type DistanceUnit = 'km' | 'mi';

interface SettingsState {
  units: DistanceUnit;
}

const initialState: SettingsState = { units: 'km' };

/** Persisted user settings. Phase 6 adds the rest (map toggles). */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<DistanceUnit>) => {
      state.units = action.payload;
    },
  },
});

export const { setUnits } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
export const selectUnits = (state: RootState): DistanceUnit => state.settings.units;
