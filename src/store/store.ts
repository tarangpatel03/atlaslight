import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { baseApi } from '@/api/baseApi';
import { journeysUiReducer, mapUiReducer, settingsReducer, statsUiReducer } from './slices';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  settings: settingsReducer,
  journeysUi: journeysUiReducer,
  mapUi: mapUiReducer,
  statsUi: statsUiReducer,
});

// The explicit state type keeps autoMergeLevel2's loose typing from widening the store types.
const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  {
    key: 'root',
    storage: createAsyncStorage('atlaslight'),
    // Only UI/settings slices belong here. Database data (baseApi) is never persisted.
    whitelist: ['settings'],
    // Merge saved settings over the defaults, so keys added later (older installs saved only some) keep their default.
    stateReconciler: autoMergeLevel2,
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist actions carry functions, which the serializable check would flag.
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
