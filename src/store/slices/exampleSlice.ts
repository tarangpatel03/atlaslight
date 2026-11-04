import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// EXAMPLE: delete or replace. Pattern for client/UI state: Redux holds UI state such as filters,
// while server data lives in TanStack Query (see hooks/useExamples.ts). This slice is persisted.
interface ExampleState {
  search: string;
}

const initialState: ExampleState = { search: '' };

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { setSearch } = exampleSlice.actions;
export const exampleReducer = exampleSlice.reducer;

export const selectExampleSearch = (state: { example: ExampleState }): string =>
  state.example.search;
