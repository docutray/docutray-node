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
  data: Record<string, unknown>;
}

/**
 * Status of a conversion operation, as returned by the API.
 */
export interface ConversionStatus {
  conversionId: string;
  status: ConversionStatusType;
  statusUrl: string | null;
  requestTimestamp: string | null;
  responseTimestamp: string | null;
  documentTypeCode: string | null;
  originalFilename: string | null;
  data: Record<string, unknown> | null;
  error: string | null;
}

/**
 * Parameters for creating a conversion request.
 */
export interface ConvertParams {
  documentTypeCode: string;
  file?: FileInput;
  url?: string;
  base64?: string;
  contentType?: ImageContentType;
  filename?: string;
  wait?: boolean;
  webhookUrl?: string;
}

/**
 * Returns `true` if the conversion has reached a terminal state (SUCCESS or ERROR).
 */
export function isConversionComplete(status: ConversionStatus): boolean {
  return status.status === 'SUCCESS' || status.status === 'ERROR';
}

/**
 * Returns `true` if the conversion completed successfully.
 */
export function isConversionSuccess(status: ConversionStatus): boolean {
  return status.status === 'SUCCESS';
}

/**
 * Returns `true` if the conversion failed with an error.
 */
export function isConversionError(status: ConversionStatus): boolean {
  return status.status === 'ERROR';
}
