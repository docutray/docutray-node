import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { createDocuTrayClient, TEST_BASE_URL } from '../helpers/fixtures.js';
import type { DocumentType } from '../../src/types/document-type.js';

function makePage(page: number, limit: number, total: number) {
  const items: DocumentType[] = [];
  const start = (page - 1) * limit;
  for (let i = 0; i < limit && start + i < total; i++) {
    items.push({
      id: `dt-${start + i + 1}`,
      name: `Type ${start + i + 1}`,
      codeType: `type-${start + i + 1}`,
      description: `Document type ${start + i + 1}`,
      isPublic: true,
      isDraft: false,
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      jsonSchema: null,
    });
  }
  return {
    data: items,
    pagination: { total, page, limit },
  };
}

describe('Integration: Pagination', () => {
  it('iterates across multiple pages with autoPagingIter', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? 1);
        const limit = Number(url.searchParams.get('limit') ?? 2);
        return HttpResponse.json(makePage(page, limit, 5));
      }),
    );

    const client = createDocuTrayClient();
    const firstPage = await client.documentTypes.list({ page: 1, limit: 2 });

    const allItems: DocumentType[] = [];
    for await (const item of firstPage.autoPagingIter()) {
      allItems.push(item);
    }

    expect(allItems).toHaveLength(5);
    expect(allItems[0].id).toBe('dt-1');
    expect(allItems[4].id).toBe('dt-5');
  });

  it('toArray respects limit', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types`, ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? 1);
        const limit = Number(url.searchParams.get('limit') ?? 2);
        return HttpResponse.json(makePage(page, limit, 10));
      }),
    );

    const client = createDocuTrayClient();
    const firstPage = await client.documentTypes.list({ page: 1, limit: 2 });
    const items = await firstPage.toArray({ limit: 3 });

    expect(items).toHaveLength(3);
  });

  it('early break stops fetching subsequent pages', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types`, ({ request }) => {
        requestCount++;
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? 1);
        const limit = Number(url.searchParams.get('limit') ?? 2);
        return HttpResponse.json(makePage(page, limit, 10));
      }),
    );

    const client = createDocuTrayClient();
    const firstPage = await client.documentTypes.list({ page: 1, limit: 2 });

    const collected: DocumentType[] = [];
    for await (const item of firstPage.autoPagingIter()) {
      collected.push(item);
      if (collected.length >= 2) break;
    }

    expect(collected).toHaveLength(2);
    // Only the first page should have been fetched (initial request)
    expect(requestCount).toBe(1);
  });
});
