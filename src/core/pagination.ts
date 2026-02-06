import type { APIClient } from './api-client.js';
import type { RequestOptions } from './types.js';

export interface PageResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface PageOptions {
  client: APIClient;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  options?: RequestOptions;
}

export class Page<T> {
  readonly data: T[];
  private readonly pagination: { total: number; page: number; limit: number };
  private readonly pageOptions: PageOptions;

  constructor(response: PageResponse<T>, pageOptions: PageOptions) {
    this.data = response.data;
    this.pagination = response.pagination;
    this.pageOptions = pageOptions;
  }

  hasNextPage(): boolean {
    return this.pagination.page * this.pagination.limit < this.pagination.total;
  }

  async nextPage(): Promise<Page<T>> {
    if (!this.hasNextPage()) {
      throw new Error('No more pages available');
    }

    const query = {
      ...this.pageOptions.query,
      page: this.pagination.page + 1,
      limit: this.pagination.limit,
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
      for (const item of page.data) {
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
