/**
 * Lazy-parsed wrapper around an HTTP response.
 *
 * Provides access to the status code and headers before parsing the body.
 * Obtain a `RawResponse` by using the `withRawResponse` accessor on any resource.
 *
 * @example
 * ```ts
 * const raw = await client.convert.withRawResponse.run({
 *   documentTypeCode: 'invoice',
 *   url: 'https://example.com/invoice.pdf',
 * });
 * console.log(raw.statusCode); // 200
 * console.log(raw.headers.get('x-request-id'));
 * const data = await raw.parse();
 * ```
 */
export class RawResponse<T> {
  /** The HTTP status code. */
  readonly statusCode: number;
  /** The HTTP response headers. */
  readonly headers: Headers;
  /** @internal */
  private readonly response: Response;
  /** @internal */
  private parsed: { value: T } | undefined;

  /** @internal */
  constructor(response: Response) {
    this.response = response;
    this.statusCode = response.status;
    this.headers = response.headers;
  }

  /**
   * Parses and returns the response body. The result is cached after the first call.
   *
   * @returns The parsed response body.
   */
  async parse(): Promise<T> {
    if (this.parsed) {
      return this.parsed.value;
    }
    const contentType = this.headers.get('content-type') ?? '';
    let value: T;
    if (contentType.includes('application/json')) {
      value = (await this.response.json()) as T;
    } else {
      value = (await this.response.text()) as T;
    }
    this.parsed = { value };
    return value;
  }
}
