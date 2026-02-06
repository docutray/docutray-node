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
 * Result of a successful identification, including primary and alternative matches.
 */
export interface IdentificationResult {
  /** The best-matching document type. */
  documentType: DocumentTypeMatch;
  /** Other possible document type matches, ordered by confidence. */
  alternatives: DocumentTypeMatch[];
}

/**
 * Status of an identification operation, as returned by the API.
 */
export interface IdentificationStatus {
  /** Unique identifier for this identification. */
  id: string;
  /** Current status of the identification. */
  status: IdentificationStatusType;
  /** URL to poll for status updates. */
  status_url: string | null;
  /** Timestamp when the identification was requested. */
  request_timestamp: string | null;
  /** Timestamp when the identification completed. */
  response_timestamp: string | null;
  /** The original filename of the uploaded document. */
  original_filename: string | null;
  /** The best-matching document type (populated on success). */
  document_type: DocumentTypeMatch | null;
  /** Alternative document type matches (populated on success). */
  alternatives: DocumentTypeMatch[] | null;
  /** Error message (populated on failure). */
  error: string | null;
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
  /** Restrict identification to these document type codes. */
  documentTypeCodeOptions?: string[];
  /** When `true`, the API waits for identification to complete before responding. */
  wait?: boolean;
  /** URL to receive a webhook notification when identification completes. */
  webhookUrl?: string;
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
