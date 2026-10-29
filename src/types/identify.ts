import type { FileInput } from '../core/types.js';
import type { ImageContentType } from './shared.js';

/**
 * Possible statuses for an identification operation.
 */
export type IdentificationStatusType = 'ENQUEUED' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

/**
 * A document type match with confidence score.
 */
export interface DocumentTypeMatch {
  /** The unique document type code. */
  code: string;
  /** Human-readable name of the document type. */
  name: string;
  /** Confidence score between 0 and 1. */
  confidence: number;
}

/**
 * Result of a synchronous identification (`identify.run()`).
 */
export interface IdentificationResult {
  /**
   * The best-matching document type. When the document matches none of the
   * options, `code` is `'otro'`.
   */
  document_type: DocumentTypeMatch;
  /** Other possible matches, ordered by confidence. Absent when there are none. */
  alternatives?: DocumentTypeMatch[];
}

/**
 * Response of `identify.runAsync()`: the identification was queued.
 */
export interface IdentificationEnqueued {
  /** Unique identifier for this identification; pass it to `identify.getStatus()`. */
  id: string;
  /** Always `ENQUEUED`. */
  status: 'ENQUEUED';
  /** Always `null` at this point. */
  documentTypeCode: null;
}

/**
 * Status of an asynchronous identification (`identify.getStatus()`).
 */
export interface IdentificationStatus {
  /** Unique identifier for this identification. */
  id: string;
  /** Current status of the identification. */
  status: IdentificationStatusType;
  /**
   * Document type codes considered. On `SUCCESS`, the options sent with the
   * request; in other states, every code the organization can access.
   */
  document_type_code_options: string[];
  /** Timestamp when the identification was requested. */
  request_timestamp: string;
  /** Timestamp when the identification finished (`SUCCESS` or `ERROR`). */
  response_timestamp?: string;
  /**
   * The best-matching document type (on `SUCCESS`). `null` when the result is
   * no longer available (results are kept for 48 hours).
   */
  document_type?: DocumentTypeMatch | null;
  /** Alternative matches (on `SUCCESS`). */
  alternatives?: DocumentTypeMatch[];
  /** Error message (on `ERROR`). */
  error?: string | null;
}

/**
 * Parameters for creating an identification request.
 *
 * Provide exactly one of `file`, `url`, or `base64` as the document source.
 */
export interface IdentifyParams {
  /** A file to upload via multipart form. */
  file?: FileInput;
  /** A URL pointing to the document. */
  url?: string;
  /** A base64-encoded document string. */
  base64?: string;
  /** MIME type hint for the document. */
  contentType?: ImageContentType;
  /** Filename hint for content type detection. */
  filename?: string;
  /** Document type codes to choose from. Required by the API (at least one). */
  documentTypeCodeOptions: string[];
  /**
   * Metadata to attach to the document (for example your own ids). It is
   * echoed in status responses and webhooks. With file uploads, values must
   * be strings, numbers, booleans or `null`.
   */
  documentMetadata?: Record<string, unknown>;
}

/**
 * Returns `true` if the identification has reached a terminal state (SUCCESS or ERROR).
 */
export function isIdentificationComplete(
  status: IdentificationStatus,
): status is IdentificationStatus & { status: 'SUCCESS' | 'ERROR' } {
  return status.status === 'SUCCESS' || status.status === 'ERROR';
}

/**
 * Returns `true` if the identification completed successfully.
 */
export function isIdentificationSuccess(
  status: IdentificationStatus,
): status is IdentificationStatus & { status: 'SUCCESS' } {
  return status.status === 'SUCCESS';
}

/**
 * Returns `true` if the identification failed with an error.
 */
export function isIdentificationError(
  status: IdentificationStatus,
): status is IdentificationStatus & { status: 'ERROR' } {
  return status.status === 'ERROR';
}
