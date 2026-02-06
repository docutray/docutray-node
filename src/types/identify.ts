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
  code: string;
  name: string;
  confidence: number;
}

/**
 * Result of a successful identification, including primary and alternative matches.
 */
export interface IdentificationResult {
  documentType: DocumentTypeMatch;
  alternatives: DocumentTypeMatch[];
}

/**
 * Status of an identification operation, as returned by the API.
 */
export interface IdentificationStatus {
  identificationId: string;
  status: IdentificationStatusType;
  statusUrl: string | null;
  requestTimestamp: string | null;
  responseTimestamp: string | null;
  originalFilename: string | null;
  documentType: DocumentTypeMatch | null;
  alternatives: DocumentTypeMatch[] | null;
  error: string | null;
}

/**
 * Parameters for creating an identification request.
 */
export interface IdentifyParams {
  file?: FileInput;
  url?: string;
  base64?: string;
  contentType?: ImageContentType;
  filename?: string;
  wait?: boolean;
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
