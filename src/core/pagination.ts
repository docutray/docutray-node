import type { APIClient } from './api-client.js';
import type { RequestOptions } from './types.js';

/**
 * Raw paginated response shape from the API.
 */
export interface PageResponse<T> {
  /** The items on this page. */
  data: T[];
  /** Pagination metadata. */
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Options used internally to fetch subsequent pages.
 * @internal
 */
export interface PageOptions {
  client: APIClient;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  options?: RequestOptions;
}

/**
 * Offset-based page of results with built-in iteration helpers.
 *
 * @example
 * ```ts
 * const page = await client.documentTypes.list({ limit: 10 });
 *
 * // Iterate all items across all pages
 * for await (const docType of page.autoPagingIter()) {
 *   console.log(docType.name);
 * }
 *
 * // Or collect into an array (with a safety limit)
 * const all = await page.toArray({ limit: 100 });
 * ```
 */
export class Page<T> {
  /** The items on the current page. */
  readonly data: T[];
  /** @internal */
  private readonly pagination: { total: number; page: number; limit: number };
  /** @internal */
  private readonly pageOptions: PageOptions;

  /** @internal */
  constructor(response: PageResponse<T>, pageOptions: PageOptions) {
    this.data = response.data;
    this.pagination = response.pagination;
    this.pageOptions = pageOptions;
  }

  /**
   * Returns `true` if there are more pages available after this one.
   */
  hasNextPage(): boolean {
    return this.pagination.page * this.pagination.limit < this.pagination.total;
  }

  /**
   * Fetches the next page of results.
   *
   * @throws {Error} if there are no more pages.
   */
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

  /**
   * Async generator that yields each page starting from the current one.
   */
  async *iterPages(): AsyncIterableIterator<Page<T>> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Page<T> = this;
    yield current;
    while (current.hasNextPage()) {
      current = await current.nextPage();
      yield current;
    }
  }

  /**
   * Async generator that yields each individual item across all pages.
   */
  async *autoPagingIter(): AsyncIterableIterator<T> {
    for await (const page of this.iterPages()) {
      for (const item of page.data) {
        yield item;
      }
    }
  }

  /**
   * Collects items across pages into an array, up to the given limit.
   *
   * @param options - An object with a `limit` property specifying the maximum number of items.
   * @returns An array of items.
   */
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
