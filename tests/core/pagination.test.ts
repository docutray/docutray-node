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
  describe('items', () => {
    it('exposes items from the page response', () => {
      const client = createMockClient([]);
      const page = createPage({ items: [{ id: 1 }, { id: 2 }] }, client);
      expect(page.items).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('hasNextPage', () => {
    it('returns true when next_cursor is present', () => {
      const client = createMockClient([]);
      const page = createPage({ items: [], next_cursor: 'abc' }, client);
      expect(page.hasNextPage()).toBe(true);
    });

    it('returns false when next_cursor is null', () => {
      const client = createMockClient([]);
      const page = createPage({ items: [], next_cursor: null }, client);
      expect(page.hasNextPage()).toBe(false);
    });

    it('returns false when next_cursor is undefined', () => {
      const client = createMockClient([]);
      const page = createPage({ items: [] }, client);
      expect(page.hasNextPage()).toBe(false);
    });

    it('returns false when next_cursor is empty string', () => {
      const client = createMockClient([]);
      const page = createPage({ items: [], next_cursor: '' }, client);
      expect(page.hasNextPage()).toBe(false);
    });
  });

  describe('nextPage', () => {
    it('fetches the next page using cursor', async () => {
      const client = createMockClient([
        { items: [{ id: 3 }], next_cursor: null },
      ]);
      const page = createPage(
        { items: [{ id: 1 }, { id: 2 }], next_cursor: 'cursor_1' },
        client,
      );

      const next = await page.nextPage();
      expect(next.items).toEqual([{ id: 3 }]);
      expect(next.hasNextPage()).toBe(false);
    });

    it('throws when no more pages', async () => {
      const client = createMockClient([]);
      const page = createPage({ items: [] }, client);
      await expect(page.nextPage()).rejects.toThrow('No more pages available');
    });
  });

  describe('iterPages', () => {
    it('yields all pages in sequence', async () => {
      const client = createMockClient([
        { items: [{ id: 3 }, { id: 4 }], next_cursor: 'cursor_2' },
        { items: [{ id: 5 }], next_cursor: null },
      ]);

      const firstPage = createPage(
        { items: [{ id: 1 }, { id: 2 }], next_cursor: 'cursor_1' },
        client,
      );

      const pages: Array<Page<{ id: number }>> = [];
      for await (const page of firstPage.iterPages()) {
        pages.push(page);
      }

      expect(pages).toHaveLength(3);
      expect(pages[0].items).toEqual([{ id: 1 }, { id: 2 }]);
      expect(pages[1].items).toEqual([{ id: 3 }, { id: 4 }]);
      expect(pages[2].items).toEqual([{ id: 5 }]);
    });
  });

  describe('autoPagingIter', () => {
    it('yields all items across pages', async () => {
      const client = createMockClient([
        { items: [{ id: 3 }], next_cursor: null },
      ]);

      const firstPage = createPage(
        { items: [{ id: 1 }, { id: 2 }], next_cursor: 'cursor_1' },
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
        { items: [{ id: 3 }, { id: 4 }], next_cursor: 'cursor_2' },
        { items: [{ id: 5 }, { id: 6 }], next_cursor: null },
      ]);

      const firstPage = createPage(
        { items: [{ id: 1 }, { id: 2 }], next_cursor: 'cursor_1' },
        client,
      );

      const items = await firstPage.toArray({ limit: 4 });
      expect(items).toHaveLength(4);
      expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    });

    it('returns all items when fewer than limit', async () => {
      const client = createMockClient([]);
      const page = createPage(
        { items: [{ id: 1 }, { id: 2 }], next_cursor: null },
        client,
      );

      const items = await page.toArray({ limit: 100 });
      expect(items).toHaveLength(2);
    });
  });
});
