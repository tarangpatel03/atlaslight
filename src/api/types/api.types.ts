/** Pagination info returned with list responses. */
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Successful API response envelope. */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

/** One failed input field, as reported by validation. */
export interface ApiErrorDetail {
  field: string;
  messages: string[];
}

/** Error API response envelope. Never contains stack traces or SQL. */
export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  details?: ApiErrorDetail[];
  path: string;
  timestamp: string;
}
