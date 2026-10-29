import { describe, it, expect } from 'vitest';
import type {
  ConversionWebhookPayload,
  IdentificationWebhookPayload,
  StepWebhookPayload,
} from '../../src/types/webhook.js';

// Bodies as sent by the API's webhook delivery (docutray @ ef353936).
describe('webhook payload types', () => {
  it('types an IDENTIFICATION_COMPLETED body', () => {
    const payload: IdentificationWebhookPayload = {
      identification_id: 'id-456',
      status: 'SUCCESS',
      request_timestamp: '2025-01-01T00:00:00Z',
      original_filename: 'a.pdf',
      document_metadata: { ref: 'A-1' },
      document_type_code_options: ['invoice', 'receipt'],
      response_timestamp: '2025-01-01T00:00:02Z',
      document_type: { code: 'invoice', name: 'Invoice', confidence: 0.95 },
      alternatives: [{ code: 'receipt', name: 'Receipt', confidence: 0.3 }],
    };

    expect(payload.document_type?.code).toBe('invoice');
  });

  it('types a STEP_FAILED body with a string error and lowercase status', () => {
    const payload: StepWebhookPayload = {
      step_execution_id: 'exec-abc',
      step_id: 'step-1',
      step_name: 'Test Step',
      status: 'failed',
      request_timestamp: '2025-01-01T00:00:00Z',
      response_timestamp: '2025-01-01T00:00:03Z',
      error: 'Processing failed',
      document_metadata: {},
    };

    expect(payload.status).toBe('failed');
  });

  it('types a CONVERSION_STARTED body with a typed status', () => {
    const payload: ConversionWebhookPayload = {
      conversion_id: 'conv-123',
      status: 'PROCESSING',
      document_type_code: 'invoice',
    };

    expect(payload.status).toBe('PROCESSING');
  });
});
