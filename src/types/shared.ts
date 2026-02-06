/**
 * Pagination metadata from the API.
 */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
}

/**
 * Generic paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Accepted image/document MIME types for file uploads.
 */
export type ImageContentType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/tiff'
  | 'image/webp'
  | 'application/pdf';

/**
 * Rate limit information extracted from API response headers.
 * `reset` is the time when the limit resets, expressed as epoch seconds.
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Quota exceeded details returned in 429 responses.
 */
export interface QuotaExceededInfo {
  limit: number;
  used: number;
  resetDate: string;
}

/**
 * Error detail from an API error response.
 */
export interface ErrorDetail {
  message: string;
  errors: string[] | null;
}
