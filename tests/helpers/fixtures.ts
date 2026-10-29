import { APIClient } from '../../src/core/api-client.js';
import { DocuTray } from '../../src/client.js';
import type { ConversionResult, ConversionStatus } from '../../src/types/convert.js';
import type { IdentificationEnqueued, IdentificationResult, IdentificationStatus } from '../../src/types/identify.js';
import type { ConversionSpec, DocumentType, ValidationResult } from '../../src/types/document-type.js';
import type { StepExecutionEnqueued, StepExecutionStatus } from '../../src/types/step.js';
import type { KnowledgeBase, KnowledgeBaseDocument, SearchResult, SyncResult } from '../../src/types/knowledge-base.js';

export const TEST_BASE_URL = 'https://app.docutray.com';

export function createTestClient(): APIClient {
  return new APIClient({
    apiKey: 'test-key',
    baseURL: TEST_BASE_URL,
  });
}

export function createDocuTrayClient(): DocuTray {
  return new DocuTray({
    apiKey: 'test-key',
    baseURL: TEST_BASE_URL,
  });
}

export const mockConversionStatus: ConversionStatus = {
  conversion_id: 'conv-123',
  status: 'SUCCESS',
  status_url: '/api/convert-async/status/conv-123',
  request_timestamp: '2025-01-01T00:00:00Z',
  response_timestamp: '2025-01-01T00:00:01Z',
  document_type_code: 'invoice',
  original_filename: 'test.pdf',
  data: { field1: 'value1' },
  error: null,
};

/** Body of a synchronous `POST /api/convert`: data and validation, no status fields. */
export const mockConversionResult: ConversionResult = {
  data: { field1: 'value1' },
  validation: { valid: true, errors: [], warnings: [] },
};

export const mockConversionPending: ConversionStatus = {
  ...mockConversionStatus,
  status: 'ENQUEUED',
  data: null,
  response_timestamp: null,
};

/** Body of a synchronous `POST /api/identify`. */
export const mockIdentificationResult: IdentificationResult = {
  document_type: { code: 'invoice', name: 'Invoice', confidence: 0.95 },
  alternatives: [{ code: 'receipt', name: 'Receipt', confidence: 0.3 }],
};

/** Body of `POST /api/identify-async`. */
export const mockIdentificationEnqueued: IdentificationEnqueued = {
  id: 'id-456',
  status: 'ENQUEUED',
  documentTypeCode: null,
};

/** Body of `GET /api/identify-async/status/{id}` on SUCCESS. */
export const mockIdentificationStatus: IdentificationStatus = {
  id: 'id-456',
  status: 'SUCCESS',
  document_type_code_options: ['invoice', 'receipt'],
  request_timestamp: '2025-01-01T00:00:00Z',
  response_timestamp: '2025-01-01T00:00:01Z',
  document_type: { code: 'invoice', name: 'Invoice', confidence: 0.95 },
  alternatives: [{ code: 'receipt', name: 'Receipt', confidence: 0.3 }],
};

/** Body of `GET /api/identify-async/status/{id}` while processing. */
export const mockIdentificationPending: IdentificationStatus = {
  id: 'id-456',
  status: 'PROCESSING',
  document_type_code_options: ['invoice', 'receipt', 'contract'],
  request_timestamp: '2025-01-01T00:00:00Z',
};

export const mockDocumentType: DocumentType = {
  id: 'dt-789',
  name: 'Invoice',
  codeType: 'invoice',
  description: 'Standard invoice document',
  isPublic: true,
  isDraft: false,
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  jsonSchema: { fields: ['total', 'date'] },
  conversionMode: 'json',
};

/**
 * Conversion spec for the single-document-type endpoints. Kept off
 * `mockDocumentType` because list responses do not carry the field.
 */
export const mockConversionSpec: ConversionSpec = {
  columns: [
    { header: 'Invoice Number', jsonPath: '$.invoice_number' },
    { header: 'Total', jsonPath: '$.total_amount' },
  ],
};

/** A document type as returned by the single-document-type endpoints. */
export const mockDocumentTypeWithSpec: DocumentType = {
  ...mockDocumentType,
  conversionSpec: mockConversionSpec,
};

export const mockDocumentTypeCreated: DocumentType = {
  id: 'dt-new',
  name: 'Receipt',
  codeType: 'receipt',
  description: 'Receipt document type',
  isPublic: false,
  isDraft: true,
  status: 'draft',
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z',
  jsonSchema: { fields: ['total', 'merchant'] },
  conversionMode: 'multi_prompt',
};

export const mockValidationResult: ValidationResult = {
  errors: { count: 0, messages: [] },
  warnings: { count: 1, messages: ['Field "optional" has no default value'] },
};

/** Body of `POST /api/steps-async/{stepId}`. */
export const mockStepExecutionEnqueued: StepExecutionEnqueued = {
  id: 'exec-abc',
  status: 'ENQUEUED',
  step_id: 'step-1',
  step_name: 'Test Step',
};

/** Body of `GET /api/steps-async/status/{executionId}` on SUCCESS. */
export const mockStepExecutionStatus: StepExecutionStatus = {
  execution_id: 'exec-abc',
  conversion_id: 'exec-abc',
  status: 'SUCCESS',
  request_timestamp: '2025-01-01T00:00:00Z',
  response_timestamp: '2025-01-01T00:00:01Z',
  data: { result: 'processed' },
  identification: null,
  validation: { errors: { count: 0, messages: [] }, warnings: { count: 0, messages: [] } },
};

/** Body of `GET /api/steps-async/status/{executionId}` while queued. */
export const mockStepExecutionPending: StepExecutionStatus = {
  execution_id: 'exec-abc',
  conversion_id: 'exec-abc',
  status: 'ENQUEUED',
  request_timestamp: '2025-01-01T00:00:00Z',
};

export const mockKnowledgeBase: KnowledgeBase = {
  id: 'kb1',
  organizationId: 'org1',
  name: 'Test KB',
  description: 'Test knowledge base',
  schema: { type: 'object' },
  indexingPreferences: {},
  indexingFields: [],
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  _count: { documents: 10 },
};

export const mockKBDocument: KnowledgeBaseDocument = {
  id: 'cmdoc1',
  knowledgeBaseId: 'kb1',
  documentId: 'doc-ext-1',
  content: { title: 'Test Document' },
  metadata: { source: 'upload' },
  embeddingStatus: 'PENDING',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

export const mockSearchResult: SearchResult = {
  data: [{ document: mockKBDocument, similarity: 0.92 }],
  query: 'test query',
  resultsCount: 1,
};

export const mockSyncResult: SyncResult = {
  syncId: 'sync-1',
  status: 'completed',
  documentsProcessed: 5,
  embeddingsGenerated: 5,
  errors: [],
  startedAt: '2025-01-01T00:00:00Z',
  completedAt: '2025-01-01T00:00:01Z',
};
