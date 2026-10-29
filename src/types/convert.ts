import type { FileInput } from '../core/types.js';
import type { ImageContentType } from './shared.js';
import type { ConversionValidation } from './validation.js';

/**
 * Possible statuses for a conversion operation.
 */
export type ConversionStatusType = 'ENQUEUED' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

/**
 * Real dimensions of a page in the source document.
 */
export interface FieldLocationsPage {
  /** 1-based page number. */
  page: number;
  /** Page width. */
  width: number;
  /** Page height. */
  height: number;
  /** Unit of `width` and `height`. */
  unit: 'pt';
}

/**
 * Bounding box of a printed value, as floats in `0..1` relative to its page,
 * with the origin at the top-left corner.
 */
export interface FieldLocationBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Location of one extracted leaf field in the source document.
 */
export interface FieldLocation {
  /** Restricted JSONPath of the field inside `data` (e.g. `$.items[0].total`). */
  path: string;
  /** 1-based page the value appears on. */
  page: number;
  /** Bounding box of the value on that page. */
  box: FieldLocationBox;
  /** Reserved, always `null`. */
  confidence: number | null;
}

/**
 * Location of each extracted leaf field in the source document.
 *
 * Present only when the document type has `boundingBoxesEnabled`. Best-effort:
 * fields that could not be located are absent from `fields`.
 */
export interface FieldLocations {
  /** Boxes are relative to the page they belong to. */
  coordinate_space: 'page-relative';
  /** Real page dimensions. Empty for non-PDF documents. */
  pages: FieldLocationsPage[];
  /** Located fields. */
  fields: FieldLocation[];
}

/**
 * Result of a synchronous conversion (`convert.run()`).
 */
export interface ConversionResult {
  /** The structured data extracted from the document. */
  data: Record<string, unknown>;
  /**
   * Validation of the extracted data against the document type's JSON Schema
   * and DSL rules. Informational: it never changes the conversion outcome.
   * Absent on API deployments that predate the field.
   */
  validation?: ConversionValidation;
  /** Location of each extracted field. Present only when the document type has `boundingBoxesEnabled`. */
  field_locations?: FieldLocations;
}

/**
 * Response of `convert.runAsync()`: the conversion was queued.
 */
export interface ConversionEnqueued {
  /** Unique identifier for this conversion; pass it to `convert.getStatus()`. */
  conversion_id: string;
  /** Absolute URL of the conversion's status endpoint. */
  status_url: string;
  /** Always `ENQUEUED`. */
  status: 'ENQUEUED';
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
  /** Additional metadata attached to the document. */
  document_metadata?: Record<string, unknown> | null;
  /**
   * Validation of the extracted data (present when `status` is `SUCCESS`).
   * Informational: it never changes the conversion status.
   */
  validation?: ConversionValidation;
  /** Location of each extracted field. Present only when the document type has `boundingBoxesEnabled`. */
  field_locations?: FieldLocations;
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
  /**
   * Metadata to attach to the document (for example your own ids). It is
   * echoed in status responses and webhooks. With file uploads, values must
   * be strings, numbers, booleans or `null`.
   */
  documentMetadata?: Record<string, unknown>;
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
