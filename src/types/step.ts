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
  executionId: string;
  status: StepExecutionStatusType;
  requestTimestamp: string | null;
  responseTimestamp: string | null;
  stepId: string | null;
  originalFilename: string | null;
  data: Record<string, unknown> | null;
  error: string | Record<string, unknown> | null;
}

/**
 * Parameters for running a step.
 */
export interface StepsRunParams {
  stepId: string;
  file?: FileInput;
  url?: string;
  base64?: string;
  contentType?: ImageContentType;
  filename?: string;
  wait?: boolean;
  webhookUrl?: string;
}

/**
 * Returns `true` if the step execution has reached a terminal state (SUCCESS or ERROR).
 */
export function isStepExecutionComplete(status: StepExecutionStatus): boolean {
  return status.status === 'SUCCESS' || status.status === 'ERROR';
}

/**
 * Returns `true` if the step execution completed successfully.
 */
export function isStepExecutionSuccess(status: StepExecutionStatus): boolean {
  return status.status === 'SUCCESS';
}

/**
 * Returns `true` if the step execution failed with an error.
 */
export function isStepExecutionError(status: StepExecutionStatus): boolean {
  return status.status === 'ERROR';
}
