export class RawResponse<T> {
  readonly statusCode: number;
  readonly headers: Headers;
  private readonly response: Response;

  constructor(response: Response) {
    this.response = response;
    this.statusCode = response.status;
    this.headers = response.headers;
  }

  async parse(): Promise<T> {
    const contentType = this.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await this.response.json()) as T;
    }
    return (await this.response.text()) as T;
  }
}
