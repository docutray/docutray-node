import { POLL_INTERVAL, POLL_TIMEOUT } from '../lib/constants.js';
import { sleep } from '../lib/utils.js';
import { DocuTrayError, APITimeoutError } from './error.js';

export interface PollOptions<T> {
  getStatus: () => Promise<T>;
  isComplete: (result: T) => boolean;
  isFailed?: (result: T) => boolean;
  getError?: (result: T) => string;
  pollInterval?: number;
  timeout?: number;
  onStatus?: (result: T) => void;
}

export async function waitForCompletion<T>(options: PollOptions<T>): Promise<T> {
  const {
    getStatus,
    isComplete,
    isFailed,
    getError,
    pollInterval = POLL_INTERVAL,
    timeout = POLL_TIMEOUT,
    onStatus,
  } = options;

  const startTime = Date.now();

  while (true) {
    const result = await getStatus();

    if (onStatus) {
      onStatus(result);
    }

    if (isComplete(result)) {
      return result;
    }

    if (isFailed && isFailed(result)) {
      const message = getError ? getError(result) : 'Resource reached a failed state';
      throw new DocuTrayError(message);
    }

    const elapsed = Date.now() - startTime;
    if (elapsed + pollInterval > timeout) {
      throw new APITimeoutError(
        `Polling timed out after ${timeout}ms`,
      );
    }

    await sleep(pollInterval);
  }
}
