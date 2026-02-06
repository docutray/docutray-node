export class RawResponse<T> {
  readonly statusCode: number;
  readonly headers: Headers;
  private readonly response: Response;
  private parsed: { value: T } | undefined;

  constructor(response: Response) {
    this.response = response;
    this.statusCode = response.status;
    this.headers = response.headers;
  }

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
