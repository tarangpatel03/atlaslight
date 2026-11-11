import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

export type DistanceUnit = 'km' | 'mi';

const DISPLAY_NAME_MAX = 40;

interface SettingsState {
  units: DistanceUnit;
  /** Local profile name shown in Settings; empty until the user sets one. */
  displayName: string;
  showVisitedRegions: boolean;
  showRoutes: boolean;
  showPhotoPins: boolean;
}

const initialState: SettingsState = {
  units: 'km',
  displayName: '',
  showVisitedRegions: true,
  showRoutes: true,
  showPhotoPins: true,
};

/** Persisted user settings: units, display name and the Map layer toggles. */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<DistanceUnit>) => {
      state.units = action.payload;
    },
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload.trim().slice(0, DISPLAY_NAME_MAX);
    },
    setShowVisitedRegions: (state, action: PayloadAction<boolean>) => {
      state.showVisitedRegions = action.payload;
    },
    setShowRoutes: (state, action: PayloadAction<boolean>) => {
      state.showRoutes = action.payload;
    },
    setShowPhotoPins: (state, action: PayloadAction<boolean>) => {
      state.showPhotoPins = action.payload;
    },
  },
});

export const { setUnits, setDisplayName, setShowVisitedRegions, setShowRoutes, setShowPhotoPins } =
  settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
export const selectUnits = (state: RootState): DistanceUnit => state.settings.units;
export const selectDisplayName = (state: RootState): string => state.settings.displayName;
export const selectShowVisitedRegions = (state: RootState): boolean =>
  state.settings.showVisitedRegions;
export const selectShowRoutes = (state: RootState): boolean => state.settings.showRoutes;
export const selectShowPhotoPins = (state: RootState): boolean => state.settings.showPhotoPins;
