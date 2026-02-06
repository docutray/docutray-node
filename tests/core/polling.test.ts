import { describe, it, expect, vi } from 'vitest';
import { waitForCompletion } from '../../src/core/polling.js';
import { DocuTrayError, APITimeoutError } from '../../src/core/error.js';

interface MockStatus {
  status: string;
  result?: string;
  error?: string;
}

describe('waitForCompletion', () => {
  it('returns when resource completes', async () => {
    const statuses: MockStatus[] = [
      { status: 'pending' },
      { status: 'processing' },
      { status: 'completed', result: 'done' },
    ];
    let callIndex = 0;

    const result = await waitForCompletion<MockStatus>({
      getStatus: async () => statuses[callIndex++],
      isComplete: (s) => s.status === 'completed',
      pollInterval: 10,
      timeout: 5000,
    });

    expect(result).toEqual({ status: 'completed', result: 'done' });
  });

  it('throws DocuTrayError on failure', async () => {
    const statuses: MockStatus[] = [
      { status: 'pending' },
      { status: 'failed', error: 'Processing error' },
    ];
    let callIndex = 0;

    await expect(
      waitForCompletion<MockStatus>({
        getStatus: async () => statuses[callIndex++],
        isComplete: (s) => s.status === 'completed',
        isFailed: (s) => s.status === 'failed',
        getError: (s) => s.error ?? 'Unknown error',
        pollInterval: 10,
        timeout: 5000,
      }),
    ).rejects.toThrow(DocuTrayError);
  });

  it('throws APITimeoutError when timeout is exceeded', async () => {
    await expect(
      waitForCompletion<MockStatus>({
        getStatus: async () => ({ status: 'pending' }),
        isComplete: (s) => s.status === 'completed',
        pollInterval: 20,
        timeout: 50,
      }),
    ).rejects.toThrow(APITimeoutError);
  });

  it('invokes onStatus callback on each poll', async () => {
    const statuses: MockStatus[] = [
      { status: 'pending' },
      { status: 'processing' },
      { status: 'completed' },
    ];
    let callIndex = 0;
    const onStatus = vi.fn();

    await waitForCompletion<MockStatus>({
      getStatus: async () => statuses[callIndex++],
      isComplete: (s) => s.status === 'completed',
      pollInterval: 10,
      timeout: 5000,
      onStatus,
    });

    expect(onStatus).toHaveBeenCalledTimes(3);
    expect(onStatus).toHaveBeenNthCalledWith(1, { status: 'pending' });
    expect(onStatus).toHaveBeenNthCalledWith(2, { status: 'processing' });
    expect(onStatus).toHaveBeenNthCalledWith(3, { status: 'completed' });
  });

  it('uses default failure message when getError not provided', async () => {
    const statuses: MockStatus[] = [{ status: 'failed' }];
    let callIndex = 0;

    await expect(
      waitForCompletion<MockStatus>({
        getStatus: async () => statuses[callIndex++],
        isComplete: (s) => s.status === 'completed',
        isFailed: (s) => s.status === 'failed',
        pollInterval: 10,
        timeout: 5000,
      }),
    ).rejects.toThrow('Resource reached a failed state');
  });
});
