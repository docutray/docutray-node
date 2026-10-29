import type { ConversionValidation } from './validation.js';

/**
 * Webhook event types, sent in the `X-Docutray-Event` header.
 */
export type WebhookEventType =
  | 'CONVERSION_STARTED'
  | 'CONVERSION_COMPLETED'
  | 'CONVERSION_FAILED'
  | 'IDENTIFICATION_STARTED'
  | 'IDENTIFICATION_COMPLETED'
  | 'IDENTIFICATION_FAILED'
  | 'STEP_STARTED'
  | 'STEP_COMPLETED'
  | 'STEP_FAILED';

/**
 * Body of a conversion webhook (`CONVERSION_STARTED`, `CONVERSION_COMPLETED`,
 * `CONVERSION_FAILED`).
 *
 * @example
 * ```ts
 * import type { ConversionWebhookPayload } from 'docutray';
 *
 * const payload = (await request.json()) as ConversionWebhookPayload;
 * if (request.headers.get('x-docutray-event') === 'CONVERSION_COMPLETED') {
 *   console.log(payload.validation);
 * }
 * ```
 */
export interface ConversionWebhookPayload {
  /** Unique identifier of the conversion. */
  conversion_id: string;
  /** Conversion status (e.g. `SUCCESS`, `ERROR`). */
  status: string;
  /** Timestamp when the conversion was requested. */
  request_timestamp?: string | null;
  /** The document type code used for conversion. */
  document_type_code?: string | null;
  /** The original filename of the uploaded document. */
  original_filename?: string | null;
  /** Additional metadata attached to the document. */
  document_metadata?: Record<string, unknown> | null;
  /** Timestamp when the conversion finished. */
  response_timestamp?: string | null;
  /** The extracted structured data (on `CONVERSION_COMPLETED`). */
  data?: Record<string, unknown> | null;
  /**
   * Validation of the extracted data. Present only on `CONVERSION_COMPLETED`;
   * see {@link ConversionValidation} for the possible values.
   */
  validation?: ConversionValidation;
  /** Error message (on `CONVERSION_FAILED`). */
  error?: string | null;
}
