import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { DocumentTypes } from '../../src/resources/document-types.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import { BadRequestError } from '../../src/core/error.js';
import type {
  ConversionMode,
  ConversionSpec,
  ConversionSpecColumn,
  LegacyConversionSpec,
  MultiSheetConversionSpec,
} from '../../src/types/document-type.js';
import { isMultiSheetConversionSpec } from '../../src/types/document-type.js';
import {
  TEST_BASE_URL,
  mockConversionSpec,
  mockDocumentType,
  mockDocumentTypeCreated,
  mockDocumentTypeWithSpec,
  mockValidationResult,
} from '../helpers/fixtures.js';

function createDocumentTypes(): DocumentTypes {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new DocumentTypes(client);
}

describe('DocumentTypes', () => {
  describe('list()', () => {
    it('returns a Page of document types', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, () => {
          return HttpResponse.json({
            data: [mockDocumentType],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
      );

      const dt = createDocumentTypes();
      const page = await dt.list();

      expect(page.data).toHaveLength(1);
      expect(page.data[0].id).toBe('dt-789');
      expect(page.hasNextPage()).toBe(false);
    });

    it('passes search params as query', async () => {
      let receivedUrl = '';
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, ({ request }) => {
          receivedUrl = request.url;
          return HttpResponse.json({
            data: [],
            pagination: { total: 0, page: 1, limit: 10 },
          });
        }),
      );

      const dt = createDocumentTypes();
      await dt.list({ search: 'invoice', page: 1, limit: 5 });

      expect(receivedUrl).toContain('search=invoice');
      expect(receivedUrl).toContain('page=1');
      expect(receivedUrl).toContain('limit=5');
    });

    it('supports pagination iteration', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          if (page === 1) {
            return HttpResponse.json({
              data: [{ ...mockDocumentType, id: 'dt-1' }],
              pagination: { total: 2, page: 1, limit: 1 },
            });
          }
          return HttpResponse.json({
            data: [{ ...mockDocumentType, id: 'dt-2' }],
            pagination: { total: 2, page: 2, limit: 1 },
          });
        }),
      );

      const dt = createDocumentTypes();
      const page = await dt.list({ limit: 1 });
      const items = await page.toArray({ limit: 10 });

      expect(items).toHaveLength(2);
      expect(items[0].id).toBe('dt-1');
      expect(items[1].id).toBe('dt-2');
    });
  });

  describe('get()', () => {
    it('fetches a document type by id and unwraps response', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json({ data: mockDocumentType });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.get('dt-789');

      expect(result.id).toBe('dt-789');
      expect(result.name).toBe('Invoice');
      expect(result.codeType).toBe('invoice');
      expect(result.jsonSchema).toEqual({ fields: ['total', 'date'] });
      expect(result.conversionMode).toBe('json');
    });

    it('exposes conversionMode without requiring a cast', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json({
            data: { ...mockDocumentType, conversionMode: 'toon' },
          });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.get('dt-789');

      const mode: ConversionMode | undefined = result.conversionMode;
      expect(mode).toBe('toon');
    });
  });

  describe('validate()', () => {
    it('validates a document type', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types/dt-789/validate`, () => {
          return HttpResponse.json(mockValidationResult);
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.validate('dt-789');

      expect(result.errors.count).toBe(0);
      expect(result.warnings.count).toBe(1);
    });
  });

  describe('create()', () => {
    it('creates a document type and unwraps response', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ data: mockDocumentTypeCreated }, { status: 201 });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.create({
        name: 'Receipt',
        codeType: 'receipt',
        description: 'Receipt document type',
        jsonSchema: { fields: ['total', 'merchant'] },
        isDraft: true,
      });

      expect(result.id).toBe('dt-new');
      expect(result.name).toBe('Receipt');
      expect(result.codeType).toBe('receipt');
      expect(result.status).toBe('draft');
      expect(receivedBody).toMatchObject({
        name: 'Receipt',
        codeType: 'receipt',
        description: 'Receipt document type',
        jsonSchema: { fields: ['total', 'merchant'] },
        isDraft: true,
      });
    });
  });

  describe('update()', () => {
    it('updates a document type and unwraps response', async () => {
      const updatedType = { ...mockDocumentType, name: 'Updated Invoice', updatedAt: '2025-06-02T00:00:00Z' };
      let receivedBody: unknown;
      server.use(
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ data: updatedType });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.update('dt-789', { name: 'Updated Invoice' });

      expect(result.id).toBe('dt-789');
      expect(result.name).toBe('Updated Invoice');
      expect(receivedBody).toMatchObject({ name: 'Updated Invoice' });
    });
  });

  describe('conversionSpec', () => {
    const legacySpec: LegacyConversionSpec = {
      columns: [{ header: 'Invoice Number', jsonPath: '$.invoice_number' }],
    };
    const multiSheetSpec: MultiSheetConversionSpec = {
      sheets: [
        { name: 'Items', columns: [{ header: 'SKU', jsonPath: '$.items[*].sku' }] },
      ],
    };

    it('exposes conversionSpec on get() without requiring a cast', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json({ data: mockDocumentTypeWithSpec });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.get('dt-789');

      const spec: ConversionSpec | null | undefined = result.conversionSpec;
      expect(spec).toEqual(mockConversionSpec);
    });

    it('surfaces a null conversionSpec from get()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json({
            data: { ...mockDocumentType, conversionSpec: null },
          });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.get('dt-789');

      expect(result.conversionSpec).toBeNull();
    });

    it('sends conversionSpec verbatim on create()', async () => {
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types`, async ({ request }) => {
          receivedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { data: { ...mockDocumentTypeCreated, conversionSpec: multiSheetSpec } },
            { status: 201 },
          );
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.create({
        name: 'Receipt',
        codeType: 'receipt',
        description: 'Receipt document type',
        jsonSchema: { fields: ['total', 'merchant'] },
        conversionSpec: multiSheetSpec,
      });

      expect(receivedBody?.conversionSpec).toEqual(multiSheetSpec);
      expect(result.conversionSpec).toEqual(multiSheetSpec);
    });

    it('omits the conversionSpec key on create() when not provided', async () => {
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types`, async ({ request }) => {
          receivedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ data: mockDocumentTypeCreated }, { status: 201 });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.create({
        name: 'Receipt',
        codeType: 'receipt',
        description: 'Receipt document type',
        jsonSchema: { fields: ['total', 'merchant'] },
      });

      expect(receivedBody).not.toHaveProperty('conversionSpec');
      expect(result.conversionSpec).toBeUndefined();
    });

    it('sends conversionSpec verbatim on update()', async () => {
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
          receivedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            data: { ...mockDocumentType, conversionSpec: legacySpec },
          });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.update('dt-789', { conversionSpec: legacySpec });

      expect(receivedBody?.conversionSpec).toEqual(legacySpec);
      expect(result.conversionSpec).toEqual(legacySpec);
    });

    it('omits the conversionSpec key on update() when not provided', async () => {
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
          receivedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ data: mockDocumentType });
        }),
      );

      const dt = createDocumentTypes();
      await dt.update('dt-789', { name: 'Updated Invoice' });

      expect(receivedBody).not.toHaveProperty('conversionSpec');
    });

    it('sends null on update() to clear the stored spec', async () => {
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
          receivedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            data: { ...mockDocumentType, conversionSpec: null },
          });
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.update('dt-789', { conversionSpec: null });

      expect(receivedBody).toHaveProperty('conversionSpec');
      expect(receivedBody?.conversionSpec).toBeNull();
      expect(result.conversionSpec).toBeNull();
    });

    it('round-trips a spec from get() back into update()', async () => {
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json({ data: mockDocumentTypeWithSpec });
        }),
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
          receivedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ data: mockDocumentTypeWithSpec });
        }),
      );

      const dt = createDocumentTypes();
      const fetched = await dt.get('dt-789');
      await dt.update('dt-789', { conversionSpec: fetched.conversionSpec });

      expect(receivedBody?.conversionSpec).toEqual(mockConversionSpec);
    });

    it('is absent from list() responses', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, () => {
          return HttpResponse.json({
            data: [mockDocumentType],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
      );

      const dt = createDocumentTypes();
      const page = await dt.list();

      expect(page.data[0].conversionSpec).toBeUndefined();
    });

    it('leaves the stored spec untouched when forwarding an absent spec', async () => {
      // Regression guard: a document type from list() (or from an API
      // deployment predating the field) has no conversionSpec. Forwarding it
      // as-is must omit the key, NOT send null — null would clear the spec.
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, () => {
          return HttpResponse.json({
            data: [mockDocumentType],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
          receivedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ data: mockDocumentTypeWithSpec });
        }),
      );

      const dt = createDocumentTypes();
      const listed = (await dt.list()).data[0];
      await dt.update(listed.id, {
        name: 'Renamed',
        conversionSpec: listed.conversionSpec,
      });

      expect(receivedBody).not.toHaveProperty('conversionSpec');
      expect(receivedBody).toMatchObject({ name: 'Renamed' });
    });

    it('accepts the permissive spec shapes the API tolerates', () => {
      const emptyColumns: ConversionSpec = { columns: [] };
      const placeholderColumn: ConversionSpecColumn = { header: 'Notes' };
      const formulaColumn: ConversionSpecColumn = {
        header: 'Total',
        type: 'formula',
        formula: '=SUM(B2:B10)',
      };
      const withoutJsonPath: ConversionSpec = {
        sheets: [{ name: 'Items', columns: [placeholderColumn, formulaColumn] }],
      };

      expect(emptyColumns).toEqual({ columns: [] });
      expect(withoutJsonPath.sheets[0].columns).toHaveLength(2);
    });

    it('throws BadRequestError when the API rejects an invalid spec', async () => {
      let requestReached = false;
      server.use(
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async () => {
          requestReached = true;
          return HttpResponse.json(
            { message: "Valor de 'conversionSpec' inválido: El sheet en posición 0 debe tener un nombre válido" },
            { status: 400 },
          );
        }),
      );

      const dt = createDocumentTypes();
      // Cast: the SDK performs no client-side validation, so a spec built at
      // runtime (e.g. from parsed JSON) is sent as-is for the API to judge.
      const invalidSpec = { sheets: [{ columns: [] }] } as unknown as ConversionSpec;

      await expect(dt.update('dt-789', { conversionSpec: invalidSpec })).rejects.toThrow(
        BadRequestError,
      );
      await expect(dt.update('dt-789', { conversionSpec: invalidSpec })).rejects.toThrow(
        /conversionSpec/,
      );
      expect(requestReached).toBe(true);
    });

    describe('isMultiSheetConversionSpec()', () => {
      it('narrows a multi-sheet spec', () => {
        const spec: ConversionSpec = multiSheetSpec;

        expect(isMultiSheetConversionSpec(spec)).toBe(true);
        if (isMultiSheetConversionSpec(spec)) {
          expect(spec.sheets[0].name).toBe('Items');
        }
      });

      it('narrows a legacy spec', () => {
        const spec: ConversionSpec = legacySpec;

        expect(isMultiSheetConversionSpec(spec)).toBe(false);
        if (!isMultiSheetConversionSpec(spec)) {
          expect(spec.columns[0].header).toBe('Invoice Number');
        }
      });

      it('accepts a nullish spec without throwing', () => {
        // Callable directly on DocumentType.conversionSpec, which is absent
        // on list responses. A JS consumer must get false, not a TypeError.
        expect(isMultiSheetConversionSpec(undefined)).toBe(false);
        expect(isMultiSheetConversionSpec(null)).toBe(false);
        expect(isMultiSheetConversionSpec(mockDocumentType.conversionSpec)).toBe(false);
      });

      it('classifies a spec carrying both keys as multi-sheet', () => {
        // The API rejects both-keys specs with a 400, so one can only be built
        // locally. Honoring `sheets` drops less than falling through to an
        // empty `columns` would.
        const both = { sheets: multiSheetSpec.sheets, columns: [] } as ConversionSpec;

        expect(isMultiSheetConversionSpec(both)).toBe(true);
      });
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for list()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, () => {
          return HttpResponse.json({
            data: [mockDocumentType],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.list();

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for get()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json({ data: mockDocumentType });
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.get('dt-789');

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for create()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types`, () => {
          return HttpResponse.json({ data: mockDocumentTypeCreated }, { status: 201 });
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.create({
        name: 'Receipt',
        codeType: 'receipt',
        description: 'Receipt document type',
        jsonSchema: { fields: ['total', 'merchant'] },
      });

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(201);
    });

    it('returns RawResponse for update()', async () => {
      server.use(
        http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json({ data: mockDocumentType });
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.update('dt-789', { name: 'Updated' });

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for validate()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types/dt-789/validate`, () => {
          return HttpResponse.json(mockValidationResult);
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.validate('dt-789');

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
