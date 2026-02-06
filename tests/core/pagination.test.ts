import { describe, it, expect, vi } from 'vitest';
import { Page } from '../../src/core/pagination.js';
import type { PageResponse, PageOptions } from '../../src/core/pagination.js';
import type { APIClient } from '../../src/core/api-client.js';

function createMockClient(pages: Array<PageResponse<{ id: number }>>) {
  let callIndex = 0;
  return {
    get: vi.fn(async () => {
      const page = pages[callIndex];
      callIndex++;
      return page;
    }),
  } as unknown as APIClient;
}

function createPage<T>(
  data: PageResponse<T>,
  client: APIClient,
  path: string = '/items',
): Page<T> {
  const options: PageOptions = { client, path };
  return new Page<T>(data, options);
}

describe('Page', () => {
  describe('data', () => {
    it('exposes data from the page response', () => {
      const client = createMockClient([]);
      const page = createPage(
        { data: [{ id: 1 }, { id: 2 }], pagination: { total: 2, page: 1, limit: 10 } },
        client,
      );
      expect(page.data).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('hasNextPage', () => {
    it('returns true when more pages exist', () => {
      const client = createMockClient([]);
      const page = createPage(
        { data: [{ id: 1 }], pagination: { total: 15, page: 1, limit: 10 } },
        client,
      );
      expect(page.hasNextPage()).toBe(true);
    });

    it('returns false when on the last page', () => {
      const client = createMockClient([]);
      const page = createPage(
        { data: [{ id: 1 }], pagination: { total: 10, page: 1, limit: 10 } },
        client,
      );
      expect(page.hasNextPage()).toBe(false);
    });

    it('returns false when total is zero', () => {
      const client = createMockClient([]);
      const page = createPage(
        { data: [], pagination: { total: 0, page: 1, limit: 10 } },
        client,
      );
      expect(page.hasNextPage()).toBe(false);
    });

    it('returns false when page * limit exceeds total', () => {
      const client = createMockClient([]);
      const page = createPage(
        { data: [{ id: 1 }], pagination: { total: 5, page: 2, limit: 5 } },
        client,
      );
      expect(page.hasNextPage()).toBe(false);
    });
  });

  describe('nextPage', () => {
    it('fetches the next page using page increment', async () => {
      const client = createMockClient([
        { data: [{ id: 3 }], pagination: { total: 3, page: 2, limit: 2 } },
      ]);
      const page = createPage(
        { data: [{ id: 1 }, { id: 2 }], pagination: { total: 3, page: 1, limit: 2 } },
        client,
      );

      const next = await page.nextPage();
      expect(next.data).toEqual([{ id: 3 }]);
      expect(next.hasNextPage()).toBe(false);
    });

    it('throws when no more pages', async () => {
      const client = createMockClient([]);
      const page = createPage(
        { data: [], pagination: { total: 0, page: 1, limit: 10 } },
        client,
      );
      await expect(page.nextPage()).rejects.toThrow('No more pages available');
    });
  });

  describe('iterPages', () => {
    it('yields all pages in sequence', async () => {
      const client = createMockClient([
        { data: [{ id: 3 }, { id: 4 }], pagination: { total: 5, page: 2, limit: 2 } },
        { data: [{ id: 5 }], pagination: { total: 5, page: 3, limit: 2 } },
      ]);

      const firstPage = createPage(
        { data: [{ id: 1 }, { id: 2 }], pagination: { total: 5, page: 1, limit: 2 } },
        client,
      );

      const pages: Array<Page<{ id: number }>> = [];
      for await (const page of firstPage.iterPages()) {
        pages.push(page);
      }

      expect(pages).toHaveLength(3);
      expect(pages[0].data).toEqual([{ id: 1 }, { id: 2 }]);
      expect(pages[1].data).toEqual([{ id: 3 }, { id: 4 }]);
      expect(pages[2].data).toEqual([{ id: 5 }]);
    });
  });

  describe('autoPagingIter', () => {
    it('yields all items across pages', async () => {
      const client = createMockClient([
        { data: [{ id: 3 }], pagination: { total: 3, page: 2, limit: 2 } },
      ]);

      const firstPage = createPage(
        { data: [{ id: 1 }, { id: 2 }], pagination: { total: 3, page: 1, limit: 2 } },
        client,
      );

      const items: Array<{ id: number }> = [];
      for await (const item of firstPage.autoPagingIter()) {
        items.push(item);
      }

      expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe('toArray', () => {
    it('collects items up to the limit', async () => {
      const client = createMockClient([
        { data: [{ id: 3 }, { id: 4 }], pagination: { total: 6, page: 2, limit: 2 } },
        { data: [{ id: 5 }, { id: 6 }], pagination: { total: 6, page: 3, limit: 2 } },
      ]);

      const firstPage = createPage(
        { data: [{ id: 1 }, { id: 2 }], pagination: { total: 6, page: 1, limit: 2 } },
        client,
      );

      const items = await firstPage.toArray({ limit: 4 });
      expect(items).toHaveLength(4);
      expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    });

    it('returns all items when fewer than limit', async () => {
      const client = createMockClient([]);
      const page = createPage(
        { data: [{ id: 1 }, { id: 2 }], pagination: { total: 2, page: 1, limit: 10 } },
        client,
      );

      const items = await page.toArray({ limit: 100 });
      expect(items).toHaveLength(2);
    });
  });
});
