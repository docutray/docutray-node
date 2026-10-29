import { POLL_INTERVAL, POLL_TIMEOUT } from '../lib/constants.js';
import { sleep } from '../lib/utils.js';
import { DocuTrayError, APITimeoutError } from './error.js';

/**
 * Options for polling an async operation until completion.
 */
export interface PollOptions<T> {
  /** Function that fetches the current status. */
  getStatus: () => Promise<T>;
  /** Predicate that returns `true` when the operation is complete. */
  isComplete: (result: T) => boolean;
  /** Optional predicate that returns `true` when the operation has failed. */
  isFailed?: (result: T) => boolean;
  /** Optional function to extract an error message from a failed result. */
  getError?: (result: T) => string;
  /** Polling interval in milliseconds. Defaults to {@link POLL_INTERVAL}. */
  pollInterval?: number;
  /** Maximum time to poll in milliseconds. Defaults to {@link POLL_TIMEOUT}. */
  timeout?: number;
  /** Optional callback invoked on each poll with the latest status. */
  onStatus?: (result: T) => void;
}

/**
 * Options accepted by the `wait()` method of `runAsync()` results.
 *
 * `wait()` supplies its own status request and completion check, treats both
 * success and failure as terminal and resolves with the final status in either
 * case, so only the polling interval, timeout and status callback can be set.
 */
export type WaitOptions<T> = Pick<PollOptions<T>, 'pollInterval' | 'timeout' | 'onStatus'>;

/**
 * Polls an async operation until it reaches a terminal state.
 *
 * `isComplete` is checked before `isFailed`, so `isFailed` only takes effect
 * for states that `isComplete` does not already treat as terminal.
 *
 * @param options - Polling configuration.
 * @returns The final result once `isComplete` returns `true`.
 * @throws {@link DocuTrayError} if `isFailed` returns `true` for a result that is not complete.
 * @throws {@link APITimeoutError} if the timeout is exceeded. The check runs after each `pollInterval`.
 * @throws Any error raised by `getStatus`.
 *
 * @example
 * ```ts
 * const result = await client.convert.runAsync({
 *   documentTypeCode: 'invoice',
 *   url: 'https://example.com/invoice.pdf',
 * });
 * const completed = await result.wait();
 * ```
 */
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

    await sleep(pollInterval);

    const elapsed = Date.now() - startTime;
    if (elapsed >= timeout) {
      throw new APITimeoutError(
        `Polling timed out after ${timeout}ms`,
      );
    }
  }
}
