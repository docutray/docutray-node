import type { DocumentTypeMatch } from './identify.js';
import type { ConversionStatusType } from './convert.js';
import type { ConversionValidation, ValidationSummary } from './validation.js';

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
  /** Conversion status: `PROCESSING` on `CONVERSION_STARTED`, `SUCCESS` or `ERROR` afterwards. */
  status: ConversionStatusType;
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

/**
 * Body of an identification webhook (`IDENTIFICATION_STARTED`,
 * `IDENTIFICATION_COMPLETED`, `IDENTIFICATION_FAILED`).
 */
export interface IdentificationWebhookPayload {
  /** Unique identifier of the identification (the `id` returned by `identify.runAsync()`). */
  identification_id: string;
  /** `PROCESSING` on `IDENTIFICATION_STARTED`, `SUCCESS` on completed, `ERROR` on failed. */
  status: 'PROCESSING' | 'SUCCESS' | 'ERROR';
  /** Timestamp when the identification was requested. */
  request_timestamp: string;
  /** The original filename of the uploaded document. */
  original_filename: string;
  /** Metadata sent with `documentMetadata`. */
  document_metadata: Record<string, unknown>;
  /** The document type codes sent with the request. */
  document_type_code_options: string[];
  /** Timestamp when the identification finished (completed and failed events). */
  response_timestamp?: string;
  /** The best-matching document type (on `IDENTIFICATION_COMPLETED`). */
  document_type?: DocumentTypeMatch;
  /** Alternative matches (on `IDENTIFICATION_COMPLETED`, when there are any). */
  alternatives?: DocumentTypeMatch[];
  /** Error message (on `IDENTIFICATION_FAILED`). */
  error?: string;
}

/**
 * Body of a step webhook (`STEP_STARTED`, `STEP_COMPLETED`, `STEP_FAILED`).
 *
 * Unlike the other webhooks, `status` is lowercase.
 */
export interface StepWebhookPayload {
  /** Unique identifier of the execution (the `id` returned by `steps.runAsync()`). */
  step_execution_id: string;
  /** The step that ran. */
  step_id: string;
  /** Human-readable name of the step. */
  step_name: string;
  /** `started`, `completed` or `failed`. */
  status: 'started' | 'completed' | 'failed';
  /** Timestamp when the event was sent (not when the execution was requested). */
  request_timestamp: string;
  /** Timestamp when the execution finished (completed and failed events). */
  response_timestamp?: string;
  /** The processed data (on `STEP_COMPLETED`). */
  data?: Record<string, unknown> | null;
  /** Document identification result (on `STEP_COMPLETED`). */
  identification?: Record<string, unknown> | null;
  /** Validation summary (on `STEP_COMPLETED`). */
  validation?: ValidationSummary;
  /** Error message (on `STEP_FAILED`). A string, unlike the status endpoint's error object. */
  error?: string;
  /** Metadata sent with `documentMetadata`. */
  document_metadata?: Record<string, unknown>;
}
