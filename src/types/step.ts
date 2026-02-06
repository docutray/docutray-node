import type { FileInput } from '../core/types.js';
import type { ImageContentType } from './shared.js';

/**
 * Possible statuses for a step execution.
 */
export type StepExecutionStatusType = 'ENQUEUED' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

/**
 * Status of a step execution, as returned by the API.
 */
export interface StepExecutionStatus {
  /** Unique identifier for this execution. */
  id: string;
  /** Current status of the execution. */
  status: StepExecutionStatusType;
  /** The step identifier that was executed. */
  step_id: string | null;
  /** Human-readable name of the step. */
  step_name: string | null;
  /** Timestamp when the execution was requested. */
  requestTimestamp: string | null;
  /** Timestamp when the execution completed. */
  responseTimestamp: string | null;
  /** The original filename of the uploaded document. */
  originalFilename: string | null;
  /** The processed data result (populated on success). */
  data: Record<string, unknown> | null;
  /** Error details (populated on failure). May be a string or structured object. */
  error: string | Record<string, unknown> | null;
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
  /** Additional metadata to attach to the document being processed. */
  documentMetadata?: Record<string, unknown>;
  /** When `true`, the API waits for execution to complete before responding. */
  wait?: boolean;
  /** URL to receive a webhook notification when execution completes. */
  webhookUrl?: string;
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
