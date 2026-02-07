import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { Steps } from '../../src/resources/steps.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import { DocuTrayError } from '../../src/core/error.js';
import {
  TEST_BASE_URL,
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
          return HttpResponse.json(mockStepExecutionPending);
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
          return HttpResponse.json(mockStepExecutionPending);
        }),
      );

      const steps = createSteps();
      const result = await steps.runAsync({
        stepId: 'step-1',
        url: 'https://example.com/doc.pdf',
      });

      expect(result.id).toBe('exec-abc');
      expect(receivedBody.image_url).toBe('https://example.com/doc.pdf');
    });

    it('posts JSON when base64 is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockStepExecutionPending);
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
          return HttpResponse.json(mockStepExecutionPending);
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
          return HttpResponse.json(mockStepExecutionPending);
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
      expect(pollCount).toBeGreaterThanOrEqual(2);
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
      expect(result.id).toBe('exec-abc');
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for runAsync()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/steps-async/step-1`, () => {
          return HttpResponse.json(mockStepExecutionPending);
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
