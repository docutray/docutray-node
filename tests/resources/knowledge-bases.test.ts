import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { KnowledgeBases } from '../../src/resources/knowledge-bases.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import {
  TEST_BASE_URL,
  mockKnowledgeBase,
  mockKBDocument,
  mockSearchResult,
  mockSyncResult,
} from '../helpers/fixtures.js';

// The API wraps single resources in `{ data }`; create and delete also put a
// `statusCode` field in the body (the HTTP status is 200).
const { _count: _ignored, ...mockKnowledgeBaseWithoutCount } = mockKnowledgeBase;
const kbBase = `${TEST_BASE_URL}/api/knowledge-bases`;
const docsBase = `${kbBase}/kb1/documents`;

function createKB(): KnowledgeBases {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new KnowledgeBases(client);
}

function captureBody(method: 'post' | 'put', url: string, response: Record<string, unknown>) {
  const captured: { body?: Record<string, unknown>; url?: URL } = {};
  server.use(
    http[method](url, async ({ request }) => {
      captured.url = new URL(request.url);
      captured.body = await request.json() as Record<string, unknown>;
      return HttpResponse.json(response);
    }),
  );
  return captured;
}

describe('KnowledgeBases', () => {
  describe('list()', () => {
    it('returns a Page of knowledge bases and sends the filters', async () => {
      let url: URL | undefined;
      server.use(
        http.get(kbBase, ({ request }) => {
          url = new URL(request.url);
          return HttpResponse.json({ data: [mockKnowledgeBase], pagination: { total: 1, page: 1, limit: 20 } });
        }),
      );

      const page = await createKB().list({ search: 'invoices', isActive: false, limit: 20 });

      expect(page.data).toHaveLength(1);
      expect(page.data[0].name).toBe('Test KB');
      expect(page.data[0]._count?.documents).toBe(10);
      expect(page.hasNextPage()).toBe(false);
      expect(url?.searchParams.get('search')).toBe('invoices');
      expect(url?.searchParams.get('isActive')).toBe('false');
    });
  });

  describe('get()', () => {
    it('unwraps the data envelope', async () => {
      server.use(http.get(`${kbBase}/kb1`, () => HttpResponse.json({ data: mockKnowledgeBase })));

      const result = await createKB().get('kb1');

      expect(result.id).toBe('kb1');
      expect(result.name).toBe('Test KB');
    });
  });

  describe('create()', () => {
    it('sends name, description, schema and indexingPreferences and unwraps the envelope', async () => {
      const captured = captureBody('post', kbBase, { data: mockKnowledgeBaseWithoutCount, statusCode: 201 });

      const result = await createKB().create({
        name: 'Test KB',
        description: 'Test knowledge base',
        schema: { type: 'object' },
        indexingPreferences: { language: 'es' },
      });

      expect(result).toEqual(mockKnowledgeBaseWithoutCount);
      expect(captured.body).toEqual({
        name: 'Test KB',
        description: 'Test knowledge base',
        schema: { type: 'object' },
        indexingPreferences: { language: 'es' },
      });
    });
  });

  describe('update()', () => {
    it('unwraps the data envelope', async () => {
      const captured = captureBody('put', `${kbBase}/kb1`, { data: { ...mockKnowledgeBaseWithoutCount, name: 'Updated' } });

      const result = await createKB().update('kb1', { name: 'Updated', isActive: true });

      expect(result.name).toBe('Updated');
      expect(captured.body).toEqual({ name: 'Updated', isActive: true });
    });
  });

  describe('delete()', () => {
    it('deletes a knowledge base', async () => {
      let deleteCalled = false;
      server.use(
        http.delete(`${kbBase}/kb1`, () => {
          deleteCalled = true;
          return HttpResponse.json({ data: null, statusCode: 204 });
        }),
      );

      await expect(createKB().delete('kb1')).resolves.toBeUndefined();
      expect(deleteCalled).toBe(true);
    });
  });

  describe('search()', () => {
    it('sends the search options and returns the result', async () => {
      const captured = captureBody('post', `${kbBase}/kb1/search`, mockSearchResult as unknown as Record<string, unknown>);

      const result = await createKB().search('kb1', {
        query: 'invoices',
        limit: 5,
        similarityThreshold: 0.5,
        includeMetadata: false,
      });

      expect(result.resultsCount).toBe(1);
      expect(result.data[0].document.documentId).toBe('doc-ext-1');
      expect(captured.body).toEqual({ query: 'invoices', limit: 5, similarityThreshold: 0.5, includeMetadata: false });
    });
  });

  describe('sync()', () => {
    it('sends the options and unwraps the envelope', async () => {
      const captured = captureBody('post', `${kbBase}/kb1/sync`, { data: mockSyncResult });

      const result = await createKB().sync('kb1', { force: true });

      expect(result.status).toBe('completed');
      expect(result.embeddingsGenerated).toBe(5);
      expect(captured.body).toEqual({ force: true });
    });

    it('does not retry by default, since a timed-out sync may still be running', async () => {
      let calls = 0;
      server.use(
        http.post(`${kbBase}/kb1/sync`, () => {
          calls++;
          return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
        }),
      );

      await expect(createKB().sync('kb1')).rejects.toThrow();
      expect(calls).toBe(1);
    });

    it('retries when maxRetries is passed', async () => {
      let calls = 0;
      server.use(
        http.post(`${kbBase}/kb1/sync`, () => {
          calls++;
          return calls === 1
            ? HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
            : HttpResponse.json({ data: mockSyncResult });
        }),
      );

      const result = await createKB().sync('kb1', undefined, { maxRetries: 1 });

      expect(result.status).toBe('completed');
      expect(calls).toBe(2);
    });

    it('sends an empty body without options', async () => {
      const captured = captureBody('post', `${kbBase}/kb1/sync`, { data: mockSyncResult });

      await createKB().sync('kb1');

      expect(captured.body).toEqual({});
    });
  });

  describe('documents()', () => {
    describe('list()', () => {
      it('lists documents and sends the filters', async () => {
        let url: URL | undefined;
        server.use(
          http.get(docsBase, ({ request }) => {
            url = new URL(request.url);
            const { embeddingStatus: _status, ...listed } = mockKBDocument;
            return HttpResponse.json({ data: [listed], pagination: { total: 1, page: 1, limit: 20 } });
          }),
        );

        const page = await createKB().documents('kb1').list({ search: 'invoice', documentId: 'doc-ext' });

        expect(page.data).toHaveLength(1);
        expect(page.data[0].documentId).toBe('doc-ext-1');
        expect(url?.searchParams.get('search')).toBe('invoice');
        expect(url?.searchParams.get('documentId')).toBe('doc-ext');
      });
    });

    describe('get()', () => {
      it('gets a document by its documentId and unwraps the envelope', async () => {
        server.use(
          http.get(`${docsBase}/doc-ext-1`, () => HttpResponse.json({ data: { ...mockKBDocument, hasEmbedding: false } })),
        );

        const result = await createKB().documents('kb1').get('doc-ext-1');

        expect(result.id).toBe('cmdoc1');
        expect(result.documentId).toBe('doc-ext-1');
        expect(result.content).toEqual({ title: 'Test Document' });
      });
    });

    describe('create()', () => {
      it('sends documentId and generateEmbedding and unwraps the envelope', async () => {
        const captured = captureBody('post', docsBase, { data: mockKBDocument, statusCode: 201 });

        const result = await createKB().documents('kb1').create({
          documentId: 'doc-ext-1',
          content: { title: 'Test Document' },
          metadata: { source: 'upload' },
          generateEmbedding: false,
        });

        expect(result).toEqual(mockKBDocument);
        expect(captured.body).toEqual({
          documentId: 'doc-ext-1',
          content: { title: 'Test Document' },
          metadata: { source: 'upload' },
          generateEmbedding: false,
        });
      });
    });

    describe('update()', () => {
      it('sends regenerateEmbedding and unwraps the envelope', async () => {
        const captured = captureBody('put', `${docsBase}/doc-ext-1`, { data: { ...mockKBDocument, hasEmbedding: false } });

        const result = await createKB().documents('kb1').update('doc-ext-1', { regenerateEmbedding: true });

        expect(result.documentId).toBe('doc-ext-1');
        expect(captured.body).toEqual({ regenerateEmbedding: true });
      });
    });

    describe('delete()', () => {
      it('deletes a document by its documentId', async () => {
        let deleteCalled = false;
        server.use(
          http.delete(`${docsBase}/doc-ext-1`, () => {
            deleteCalled = true;
            return HttpResponse.json({ data: null, statusCode: 204 });
          }),
        );

        await createKB().documents('kb1').delete('doc-ext-1');

        expect(deleteCalled).toBe(true);
      });
    });

    it('encodes ids in the path', async () => {
      let path = '';
      server.use(
        http.get(`${kbBase}/:kb/documents/:doc`, ({ request }) => {
          path = new URL(request.url).pathname;
          return HttpResponse.json({ data: mockKBDocument });
        }),
      );

      await createKB().documents('kb1').get('a b');

      expect(path).toBe('/api/knowledge-bases/kb1/documents/a%20b');
    });

    describe('withRawResponse', () => {
      it('returns the envelope for documents get()', async () => {
        server.use(http.get(`${docsBase}/doc-ext-1`, () => HttpResponse.json({ data: mockKBDocument })));

        const raw = await createKB().documents('kb1').withRawResponse.get('doc-ext-1');

        expect(raw).toBeInstanceOf(RawResponse);
        expect(raw.statusCode).toBe(200);
        expect((await raw.parse()).data.documentId).toBe('doc-ext-1');
      });
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for list()', async () => {
      server.use(
        http.get(kbBase, () => HttpResponse.json({ data: [mockKnowledgeBase], pagination: { total: 1, page: 1, limit: 20 } })),
      );

      const raw = await createKB().withRawResponse.list();

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns the envelope for get()', async () => {
      server.use(http.get(`${kbBase}/kb1`, () => HttpResponse.json({ data: mockKnowledgeBase })));

      const raw = await createKB().withRawResponse.get('kb1');

      expect(raw.statusCode).toBe(200);
      expect((await raw.parse()).data.name).toBe('Test KB');
    });

    it('returns RawResponse for search()', async () => {
      server.use(http.post(`${kbBase}/kb1/search`, () => HttpResponse.json(mockSearchResult)));

      const raw = await createKB().withRawResponse.search('kb1', { query: 'test' });

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
