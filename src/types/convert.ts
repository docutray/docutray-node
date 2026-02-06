import type { FileInput } from '../core/types.js';
import type { ImageContentType } from './shared.js';

/**
 * Possible statuses for a conversion operation.
 */
export type ConversionStatusType = 'ENQUEUED' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

/**
 * Extracted data from a successful conversion.
 */
export interface ConversionResult {
  /** The structured data extracted from the document. */
  data: Record<string, unknown>;
}

/**
 * Status of a conversion operation, as returned by the API.
 */
export interface ConversionStatus {
  /** Unique identifier for this conversion. */
  conversion_id: string;
  /** Current status of the conversion. */
  status: ConversionStatusType;
  /** URL to poll for status updates. */
  status_url: string | null;
  /** Timestamp when the conversion was requested. */
  request_timestamp: string | null;
  /** Timestamp when the conversion completed. */
  response_timestamp: string | null;
  /** The document type code used for conversion. */
  document_type_code: string | null;
  /** The original filename of the uploaded document. */
  original_filename: string | null;
  /** The extracted structured data (populated on success). */
  data: Record<string, unknown> | null;
  /** Error message (populated on failure). */
  error: string | null;
}

/**
 * Parameters for creating a conversion request.
 *
 * Provide exactly one of `file`, `url`, or `base64` as the document source.
 */
export interface ConvertParams {
  /** The document type code that defines the extraction schema. */
  documentTypeCode: string;
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
  /** When `true`, the API waits for conversion to complete before responding. */
  wait?: boolean;
  /** URL to receive a webhook notification when conversion completes. */
  webhookUrl?: string;
}

/**
 * Returns `true` if the conversion has reached a terminal state (SUCCESS or ERROR).
 */
export function isConversionComplete(
  status: ConversionStatus,
): status is ConversionStatus & { status: 'SUCCESS' | 'ERROR' } {
  return status.status === 'SUCCESS' || status.status === 'ERROR';
}

/**
 * Returns `true` if the conversion completed successfully.
 */
export function isConversionSuccess(
  status: ConversionStatus,
): status is ConversionStatus & { status: 'SUCCESS' } {
  return status.status === 'SUCCESS';
}

/**
 * Returns `true` if the conversion failed with an error.
 */
export function isConversionError(
  status: ConversionStatus,
): status is ConversionStatus & { status: 'ERROR' } {
  return status.status === 'ERROR';
}
