import type { FileInput } from '../core/types.js';
import type { ImageContentType } from './shared.js';
import type { ValidationSummary } from './validation.js';

/**
 * Possible statuses for a step execution.
 */
export type StepExecutionStatusType = 'ENQUEUED' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

/**
 * Response of `steps.runAsync()`: the execution was queued.
 */
export interface StepExecutionEnqueued {
  /** Unique identifier for this execution; pass it to `steps.getStatus()`. */
  id: string;
  /** Always `ENQUEUED`. */
  status: 'ENQUEUED';
  /** The step that will run. */
  step_id: string;
  /** Human-readable name of the step. */
  step_name: string;
}

/**
 * Structured error of a failed step execution.
 */
export interface StepExecutionError {
  /** Error message. */
  message: string;
  /** Pipeline phase that failed, when known. */
  phase?: string;
  /** When the error happened, when known. */
  timestamp?: string;
  /** Machine-readable reason, when known (e.g. `stale_upload_reconciliation`). */
  reason?: string;
}

/**
 * Status of a step execution (`steps.getStatus()` and `wait()`).
 */
export interface StepExecutionStatus {
  /** Unique identifier for this execution (the `id` returned by `runAsync()`). */
  execution_id: string;
  /** @deprecated Same value as `execution_id`, kept by the API for compatibility. */
  conversion_id?: string;
  /** Current status of the execution. */
  status: StepExecutionStatusType;
  /** Timestamp when the execution started. */
  request_timestamp: string;
  /** Timestamp when the execution finished. */
  response_timestamp?: string;
  /** The processed data (on `SUCCESS`). */
  data?: Record<string, unknown> | null;
  /** Document identification result from the step pipeline (on `SUCCESS`). */
  identification?: Record<string, unknown> | null;
  /** Validation summary from the step pipeline (on `SUCCESS`): error and warning counts and messages. */
  validation?: ValidationSummary;
  /** Error details (on `ERROR`). */
  error?: StepExecutionError;
  /** Metadata attached with `documentMetadata`. */
  document_metadata?: Record<string, unknown>;
}

/**
 * Parameters for running a step.
 *
 * Provide exactly one of `file`, `url`, or `base64` as the document source.
 */
export interface StepsRunParams {
  /** The identifier of the step to execute. */
  stepId: string;
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
 * Returns `true` if the step execution has reached a terminal state (SUCCESS or ERROR).
 */
export function isStepExecutionComplete(
  status: StepExecutionStatus,
): status is StepExecutionStatus & { status: 'SUCCESS' | 'ERROR' } {
  return status.status === 'SUCCESS' || status.status === 'ERROR';
}

/**
 * Returns `true` if the step execution completed successfully.
 */
export function isStepExecutionSuccess(
  status: StepExecutionStatus,
): status is StepExecutionStatus & { status: 'SUCCESS' } {
  return status.status === 'SUCCESS';
}

/**
 * Returns `true` if the step execution failed with an error.
 */
export function isStepExecutionError(
  status: StepExecutionStatus,
): status is StepExecutionStatus & { status: 'ERROR' } {
  return status.status === 'ERROR';
}
