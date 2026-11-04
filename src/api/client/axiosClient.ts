import axios, { type AxiosResponse } from 'axios';
import { appConfig } from '@/config/app.config';
import { clearToken, getToken } from '@/auth/token.store';
import type { ApiError, ApiErrorDetail, ApiResponse } from '@/api/types/api.types';

/** A failed API call. `details` carries per-field validation messages when present. */
export class ApiRequestError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Query string values; `undefined` entries are left out. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Skip the Bearer header and the sign-out on 401 (the login call). */
  public?: boolean;
}

let unauthorizedHandler: (() => void) | null = null;

/** Registers what happens when the API rejects the stored token (the store signs the user out). */
export const setUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isApiError = (body: unknown): body is ApiError =>
  isRecord(body) && body.success === false && typeof body.message === 'string';

const isApiResponse = <T>(body: unknown): body is ApiResponse<T> =>
  isRecord(body) && body.success === true && 'data' in body;

// Statuses are inspected below (401, envelope errors), so axios must not throw on them.
// Network failures and timeouts still reject, which the UI reports as "can't reach the server".
const http = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: { Accept: 'application/json' },
  validateStatus: () => true,
});

const isOk = (response: AxiosResponse): boolean => response.status >= 200 && response.status < 300;

const toError = (status: number, body: unknown): ApiRequestError =>
  isApiError(body)
    ? new ApiRequestError(status, body.message, body.details)
    : new ApiRequestError(status, 'Something went wrong. Please try again.');

/** Calls the API and returns the full envelope (use `meta` for paginated lists). */
export const apiEnvelope = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (!options.public && token) headers.Authorization = `Bearer ${token}`;

  const response = await http.request<unknown>({
    url: path,
    method: options.method ?? 'GET',
    headers,
    data: options.body,
    params: options.params,
  });

  if (response.status === 401 && !options.public) {
    await clearToken();
    unauthorizedHandler?.();
  }

  const body = response.data;
  if (!isOk(response) || !isApiResponse<T>(body)) {
    throw toError(response.status, body);
  }
  return body;
};

/** Calls the API and returns only `data`. */
export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> =>
  (await apiEnvelope<T>(path, options)).data;
