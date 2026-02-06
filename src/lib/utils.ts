/**
 * Reads an environment variable by name.
 *
 * @param name - The environment variable name.
 * @returns The value, or `undefined` if not set.
 */
export function readEnv(name: string): string | undefined {
  return process.env[name];
}

/**
 * Returns a promise that resolves after the given number of milliseconds.
 *
 * @param ms - Duration to sleep in milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Masks an API key for safe display in logs.
 *
 * @param key - The API key to mask.
 * @returns A masked string showing only the last 4 characters, e.g. `dt_...abcd`.
 */
export function maskApiKey(key: string): string {
  if (key.length <= 4) {
    return '****';
  }
  return `dt_...${key.slice(-4)}`;
}
