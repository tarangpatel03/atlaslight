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
import { setUnauthorizedHandler } from '@/api/client/axiosClient';
import { queryClient } from '@/api/client/queryClient';
import { authReducer, sessionExpired } from '@/store/slices/authSlice';
import { baseApi } from '@/store/baseApi';
import { exampleReducer } from '@/store/slices/exampleSlice';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  example: exampleReducer, // EXAMPLE: delete or replace.
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage: createAsyncStorage('atlaslight'),
    // Only list non-sensitive UI slices here. `auth` is never persisted: the token lives in the
    // Keychain (src/auth/token.store.ts), and the session status is rebuilt from it at startup.
    whitelist: ['example'],
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

setUnauthorizedHandler(() => {
  queryClient.clear();
  store.dispatch(sessionExpired());
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
