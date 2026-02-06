import { APIClient } from '../../src/core/api-client.js';
import type { ConversionStatus } from '../../src/types/convert.js';
import type { IdentificationStatus } from '../../src/types/identify.js';
import type { DocumentType, ValidationResult } from '../../src/types/document-type.js';
import type { StepExecutionStatus } from '../../src/types/step.js';
import type { KnowledgeBase, KnowledgeBaseDocument, SearchResult, SyncResult } from '../../src/types/knowledge-base.js';

export const TEST_BASE_URL = 'https://api.docutray.com/v1';

export function createTestClient(): APIClient {
  return new APIClient({
    apiKey: 'test-key',
    baseURL: TEST_BASE_URL,
  });
}

export const mockConversionStatus: ConversionStatus = {
  conversionId: 'conv-123',
  status: 'SUCCESS',
  statusUrl: '/api/convert-async/status/conv-123',
  requestTimestamp: '2025-01-01T00:00:00Z',
  responseTimestamp: '2025-01-01T00:00:01Z',
  documentTypeCode: 'invoice',
  originalFilename: 'test.pdf',
  data: { field1: 'value1' },
  error: null,
};

export const mockConversionPending: ConversionStatus = {
  ...mockConversionStatus,
  status: 'ENQUEUED',
  data: null,
  responseTimestamp: null,
};

export const mockIdentificationStatus: IdentificationStatus = {
  identificationId: 'id-456',
  status: 'SUCCESS',
  statusUrl: '/api/identify-async/status/id-456',
  requestTimestamp: '2025-01-01T00:00:00Z',
  responseTimestamp: '2025-01-01T00:00:01Z',
  originalFilename: 'test.pdf',
  documentType: { code: 'invoice', name: 'Invoice', confidence: 0.95 },
  alternatives: [{ code: 'receipt', name: 'Receipt', confidence: 0.3 }],
  error: null,
};

export const mockIdentificationPending: IdentificationStatus = {
  ...mockIdentificationStatus,
  status: 'ENQUEUED',
  documentType: null,
  alternatives: null,
  responseTimestamp: null,
};

export const mockDocumentType: DocumentType = {
  id: 'dt-789',
  name: 'Invoice',
  codeType: 'invoice',
  description: 'Standard invoice document',
  isPublic: true,
  isDraft: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  schema: { fields: ['total', 'date'] },
};

export const mockValidationResult: ValidationResult = {
  errors: { count: 0, messages: [] },
  warnings: { count: 1, messages: ['Field "optional" has no default value'] },
};

export const mockStepExecutionStatus: StepExecutionStatus = {
  executionId: 'exec-abc',
  status: 'SUCCESS',
  requestTimestamp: '2025-01-01T00:00:00Z',
  responseTimestamp: '2025-01-01T00:00:01Z',
  stepId: 'step-1',
  originalFilename: 'test.pdf',
  data: { result: 'processed' },
  error: null,
};

export const mockStepExecutionPending: StepExecutionStatus = {
  ...mockStepExecutionStatus,
  status: 'ENQUEUED',
  data: null,
  responseTimestamp: null,
};

export const mockKnowledgeBase: KnowledgeBase = {
  id: 'kb-1',
  name: 'Test KB',
  description: 'Test knowledge base',
  schema: null,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  documentCount: 10,
};

export const mockKBDocument: KnowledgeBaseDocument = {
  id: 'doc-1',
  documentId: 'doc-ext-1',
  content: { title: 'Test Document' },
  metadata: { source: 'upload' },
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
  errors: null,
  startedAt: '2025-01-01T00:00:00Z',
  completedAt: '2025-01-01T00:00:01Z',
};
