/**
 * Pagination metadata from the API.
 */
export interface Pagination {
  /** Total number of items across all pages. */
  total: number;
  /** Current page number (1-based). */
  page: number;
  /** Maximum items per page. */
  limit: number;
}

/**
 * Generic paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  /** The items on this page. */
  data: T[];
  /** Pagination metadata. */
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
 */
export interface RateLimitInfo {
  /** Maximum number of requests allowed in the current window. */
  limit: number;
  /** Number of requests remaining in the current window. */
  remaining: number;
  /** Time when the limit resets, expressed as epoch seconds. */
  reset: number;
}

/**
 * Quota exceeded details returned in 429 responses.
 */
export interface QuotaExceededInfo {
  /** The quota limit. */
  limit: number;
  /** How much of the quota has been used. */
  used: number;
  /** ISO 8601 date when the quota resets. */
  resetDate: string;
}

/**
 * Error detail from an API error response.
 */
export interface ErrorDetail {
  /** Human-readable error message. */
  message: string;
  /** Optional list of specific validation or processing errors. */
  errors: string[] | null;
}
