/** Global prefix and URI version the API mounts every controller under. */
export const API_PREFIX = 'api';
export const API_VERSION = '1';
export const API_BASE_PATH = `/${API_PREFIX}/v${API_VERSION}`;

/**
 * Absolute client paths (relative to `API_BASE_PATH`). Never type a path string in a screen or hook:
 * add it here first, then use it. Builders cover the `:param` routes.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  // EXAMPLE: delete or replace.
  example: {
    list: '/examples',
    byId: (id: string): string => `/examples/${id}`,
  },
} as const;
