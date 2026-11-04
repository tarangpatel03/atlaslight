import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.boilerapp.auth-token';
// The Keychain entry needs a username; the value is not used.
const ACCOUNT = 'auth-token';

let token: string | null = null;
let loaded = false;

/** Reads the stored token once at startup. Call before the first API request. */
export const loadToken = async (): Promise<void> => {
  if (loaded) return;
  try {
    const stored = await Keychain.getGenericPassword({ service: SERVICE });
    token = stored ? stored.password : null;
  } catch {
    // An unreadable Keychain entry means the user simply has to sign in again.
    token = null;
  }
  loaded = true;
};

/** The token is sent as a Bearer header; it stays valid until the user signs out. */
export const getToken = (): string | null => token;

/** Failing to persist must not break the session: it lasts until the app closes. */
export const setToken = async (value: string): Promise<void> => {
  token = value;
  try {
    await Keychain.setGenericPassword(ACCOUNT, value, { service: SERVICE });
  } catch {
    // The next start asks for a login.
  }
};

export const clearToken = async (): Promise<void> => {
  token = null;
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch {
    // Nothing stored or Keychain unavailable; the in-memory state is already cleared.
  }
};
