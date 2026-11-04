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
import { baseApi } from '@/api/baseApi';
import { settingsReducer } from '@/store/slices/settingsSlice';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage: createAsyncStorage('atlaslight'),
    // Only UI/settings slices belong here. Database data (baseApi) is never persisted.
    whitelist: ['settings'],
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
