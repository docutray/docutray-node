import type { APIClient } from './api-client.js';
import type { RequestOptions } from './types.js';

export interface PageResponse<T> {
  items: T[];
  next_cursor?: string | null;
}

export interface PageOptions {
  client: APIClient;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  options?: RequestOptions;
}

export class Page<T> {
  readonly items: T[];
  private readonly nextCursor: string | null;
  private readonly pageOptions: PageOptions;

  constructor(data: PageResponse<T>, pageOptions: PageOptions) {
    this.items = data.items;
    this.nextCursor = data.next_cursor ?? null;
    this.pageOptions = pageOptions;
  }

  hasNextPage(): boolean {
    return this.nextCursor !== null && this.nextCursor !== '';
  }

  async nextPage(): Promise<Page<T>> {
    if (!this.hasNextPage()) {
      throw new Error('No more pages available');
    }

    const query = {
      ...this.pageOptions.query,
      cursor: this.nextCursor!,
    };

    const response = await this.pageOptions.client.get<PageResponse<T>>(
      this.pageOptions.path,
      { ...this.pageOptions.options, query },
    ) as PageResponse<T>;

    return new Page<T>(response, this.pageOptions);
  }

  async *iterPages(): AsyncIterableIterator<Page<T>> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Page<T> = this;
    yield current;
    while (current.hasNextPage()) {
      current = await current.nextPage();
      yield current;
    }
  }

  async *autoPagingIter(): AsyncIterableIterator<T> {
    for await (const page of this.iterPages()) {
      for (const item of page.items) {
        yield item;
      }
    }
  }

  async toArray(options: { limit: number }): Promise<T[]> {
    const result: T[] = [];
    for await (const item of this.autoPagingIter()) {
      result.push(item);
      if (result.length >= options.limit) {
        break;
      }
    }
    return result;
  }
}
