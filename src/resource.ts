import type { APIClient } from './core/api-client.js';

/**
 * Base class for all API resource classes.
 *
 * Each resource (e.g. {@link Convert}, {@link Identify}) extends this class
 * and uses the shared {@link APIClient} to make HTTP requests.
 */
export class APIResource {
  /** @internal */
  protected _client: APIClient;

  /** @internal */
  constructor(client: APIClient) {
    this._client = client;
  }
}
