import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { Steps } from '../../src/resources/steps.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import { DocuTrayError } from '../../src/core/error.js';
import {
  TEST_BASE_URL,
  mockStepExecutionEnqueued,
  mockStepExecutionStatus,
  mockStepExecutionPending,
} from '../helpers/fixtures.js';

function createSteps(): Steps {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new Steps(client);
}

describe('Steps', () => {
  describe('runAsync()', () => {
    it('posts multipart when file is provided', async () => {
      let receivedContentType = '';
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, async ({ request }) => {
          receivedContentType = request.headers.get('content-type') ?? '';
          return HttpResponse.json(mockStepExecutionEnqueued);
        }),
      );

      const steps = createSteps();
      const result = await steps.runAsync({
        stepId: 'step-1',
        file: Buffer.from('fake-pdf'),
        filename: 'test.pdf',
      });

      expect(result.id).toBe('exec-abc');
      expect(receivedContentType).toContain('multipart/form-data');
    });

    it('posts JSON when url is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockStepExecutionEnqueued);
        }),
      );

      const steps = createSteps();
      const result = await steps.runAsync({
        stepId: 'step-1',
        url: 'https://example.com/doc.pdf',
        documentMetadata: { ref: 'A-1' },
      });

      expect(result.id).toBe('exec-abc');
      expect(result.step_name).toBe('Test Step');
      expect(receivedBody).toEqual({
        image_url: 'https://example.com/doc.pdf',
        document_metadata: { ref: 'A-1' },
      });
    });

    it('posts JSON when base64 is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockStepExecutionEnqueued);
        }),
      );

      const steps = createSteps();
      await steps.runAsync({
        stepId: 'step-1',
        base64: 'dGVzdA==',
      });

      expect(receivedBody.image_base64).toBe('dGVzdA==');
    });

    it('throws when no file source is provided', async () => {
      const steps = createSteps();
      await expect(
        steps.runAsync({ stepId: 'step-1' }),
      ).rejects.toThrow(DocuTrayError);
      await expect(
        steps.runAsync({ stepId: 'step-1' }),
      ).rejects.toThrow('Must provide file, url, or base64');
    });

    it('returns status with wait() method', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, () => {
          return HttpResponse.json(mockStepExecutionEnqueued);
        }),
      );

      const steps = createSteps();
      const status = await steps.runAsync({
        stepId: 'step-1',
        url: 'https://example.com/doc.pdf',
      });

      expect(typeof status.wait).toBe('function');
    });

    it('wait() polls until complete', async () => {
      let pollCount = 0;
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, () => {
          return HttpResponse.json(mockStepExecutionEnqueued);
        }),
        http.get(`${TEST_BASE_URL}/api/steps-async/status/exec-abc`, () => {
          pollCount++;
          if (pollCount >= 2) {
            return HttpResponse.json(mockStepExecutionStatus);
          }
          return HttpResponse.json({ ...mockStepExecutionPending, status: 'PROCESSING' });
        }),
      );

      const steps = createSteps();
      const status = await steps.runAsync({
        stepId: 'step-1',
        url: 'https://example.com/doc.pdf',
      });

      const result = await status.wait({ pollInterval: 10 });
      expect(result.status).toBe('SUCCESS');
      expect(result.execution_id).toBe('exec-abc');
      expect(pollCount).toBeGreaterThanOrEqual(2);
    });

    it('wait() resolves with the ERROR status instead of throwing', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, () => HttpResponse.json(mockStepExecutionEnqueued)),
        http.get(`${TEST_BASE_URL}/api/steps-async/status/exec-abc`, () =>
          HttpResponse.json({
            ...mockStepExecutionPending,
            status: 'ERROR',
            response_timestamp: '2025-01-01T00:00:05Z',
            error: { message: 'Upload never completed', reason: 'stale_upload_reconciliation' },
          }),
        ),
      );

      const status = await createSteps().runAsync({ stepId: 'step-1', url: 'https://example.com/doc.pdf' });
      const result = await status.wait({ pollInterval: 10 });

      expect(result.status).toBe('ERROR');
      expect(result.error).toEqual({ message: 'Upload never completed', reason: 'stale_upload_reconciliation' });
    });
  });

  describe('getStatus()', () => {
    it('fetches step execution status by id', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/steps-async/status/exec-abc`, () => {
          return HttpResponse.json(mockStepExecutionStatus);
        }),
      );

      const steps = createSteps();
      const result = await steps.getStatus('exec-abc');
      expect(result.execution_id).toBe('exec-abc');
      expect(result.status).toBe('SUCCESS');
      expect(result.validation?.errors.count).toBe(0);
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for runAsync()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, () => {
          return HttpResponse.json(mockStepExecutionEnqueued);
        }),
      );

      const steps = createSteps();
      const raw = await steps.withRawResponse.runAsync({
        stepId: 'step-1',
        url: 'https://example.com/doc.pdf',
      });

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for getStatus()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/steps-async/status/exec-abc`, () => {
          return HttpResponse.json(mockStepExecutionStatus);
        }),
      );

      const steps = createSteps();
      const raw = await steps.withRawResponse.getStatus('exec-abc');
      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
