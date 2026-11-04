import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { queryClient } from '@/api/client/queryClient';
import { clearToken, getToken, loadToken, setToken } from '@/auth/token.store';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
}

const initialState: AuthState = { status: 'loading' };

/** Reads the stored token at startup, so a signed-in user never sees the login screen flash. */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (): Promise<boolean> => {
    await loadToken();
    return getToken() !== null;
  },
);

/** Stores the token and signs in. Call it with the token the login endpoint returns. */
export const signIn = createAsyncThunk('auth/signIn', async (token: string): Promise<void> => {
  await setToken(token);
});

/** Logout is client-side only: the token is not revoked on the server (see docs/ARCHITECTURE.md). */
export const signOut = createAsyncThunk('auth/signOut', async (): Promise<void> => {
  await clearToken();
  queryClient.clear();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** The API rejected the token (401); the client already cleared it. */
    sessionExpired: (state) => {
      state.status = 'signedOut';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = action.payload ? 'signedIn' : 'signedOut';
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'signedOut';
      })
      .addCase(signIn.fulfilled, (state) => {
        state.status = 'signedIn';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.status = 'signedOut';
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthStatus = (state: { auth: AuthState }): AuthStatus => state.auth.status;
