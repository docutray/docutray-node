import { APIClient } from '../../src/core/api-client.js';
import { DocuTray } from '../../src/client.js';
import type { ConversionStatus } from '../../src/types/convert.js';
import type { IdentificationStatus } from '../../src/types/identify.js';
import type { DocumentType, ValidationResult } from '../../src/types/document-type.js';
import type { StepExecutionStatus } from '../../src/types/step.js';
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

export const mockConversionPending: ConversionStatus = {
  ...mockConversionStatus,
  status: 'ENQUEUED',
  data: null,
  response_timestamp: null,
};

export const mockIdentificationStatus: IdentificationStatus = {
  id: 'id-456',
  status: 'SUCCESS',
  status_url: '/api/identify-async/status/id-456',
  request_timestamp: '2025-01-01T00:00:00Z',
  response_timestamp: '2025-01-01T00:00:01Z',
  original_filename: 'test.pdf',
  document_type: { code: 'invoice', name: 'Invoice', confidence: 0.95 },
  alternatives: [{ code: 'receipt', name: 'Receipt', confidence: 0.3 }],
  error: null,
};

export const mockIdentificationPending: IdentificationStatus = {
  ...mockIdentificationStatus,
  status: 'ENQUEUED',
  document_type: null,
  alternatives: null,
  response_timestamp: null,
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
  id: 'exec-abc',
  status: 'SUCCESS',
  step_id: 'step-1',
  step_name: 'Test Step',
  requestTimestamp: '2025-01-01T00:00:00Z',
  responseTimestamp: '2025-01-01T00:00:01Z',
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
