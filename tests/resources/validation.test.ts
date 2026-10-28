import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { DocumentTypes } from '../../src/resources/document-types.js';
import { Convert } from '../../src/resources/convert.js';
import { Steps } from '../../src/resources/steps.js';
import { APIClient } from '../../src/core/api-client.js';
import { BadRequestError, DSLValidationError } from '../../src/core/error.js';
import { isValidationValid } from '../../src/types/document-type.js';
import type { DocumentType, ValidationResult } from '../../src/types/document-type.js';
import type { ConversionResult, ConversionStatus } from '../../src/types/convert.js';
import type { ConversionValidation } from '../../src/types/validation.js';
import { isValidationOutcome, isValidationSystemFailure } from '../../src/types/validation.js';
import type { ConversionWebhookPayload } from '../../src/types/webhook.js';
import { TEST_BASE_URL, mockConversionStatus, mockDocumentType, mockStepExecutionStatus } from '../helpers/fixtures.js';

const rules = 'field.total greaterThan(0)';

const dslErrorBody = {
  error: 'Reglas DSL inválidas: Se esperaba un operador registrado. Encontrado: greaterThen en línea 1, columna 13',
  errors: [{ line: 1, column: 13, message: 'Se esperaba un operador registrado. Encontrado: greaterThen' }],
};

const dryRunResult: ValidationResult = {
  valid: false,
  issues: [
    {
      field: 'total',
      value: 5,
      rule: 'greaterThan',
      message: "El campo 'total' debe ser mayor que '10', pero es '5'",
      code: 'VALIDATION_ERROR',
      severity: 'error',
      source: 'rule',
    },
  ],
  errors: { count: 1, messages: ["El campo 'total' debe ser mayor que '10', pero es '5'"] },
  warnings: { count: 0, messages: [] },
};

const outcome: ConversionValidation = {
  valid: false,
  errors: [
    { field: 'invoice_number', code: 'REQUIRED_FIELD', message: "El campo 'invoice_number' es obligatorio", severity: 'error', source: 'schema' },
  ],
  warnings: [],
};

function createClient(): APIClient {
  return new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL, maxRetries: 0 });
}

describe('dslRules on document types', () => {
  const docTypeWithRules: DocumentType = { ...mockDocumentType, dslRules: rules, boundingBoxesEnabled: false };

  it('get() returns dslRules', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => HttpResponse.json({ data: docTypeWithRules })),
    );

    const result = await new DocumentTypes(createClient()).get('dt-789');

    expect(result.dslRules).toBe(rules);
    expect(result.boundingBoxesEnabled).toBe(false);
  });

  it('create() sends dslRules', async () => {
    let receivedBody: Record<string, unknown> = {};
    server.use(
      http.post(`${TEST_BASE_URL}/api/document-types`, async ({ request }) => {
        receivedBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ data: docTypeWithRules }, { status: 201 });
      }),
    );

    const result = await new DocumentTypes(createClient()).create({
      name: 'Invoice',
      codeType: 'invoice',
      description: 'Invoice',
      jsonSchema: { type: 'object' },
      dslRules: rules,
    });

    expect(receivedBody.dslRules).toBe(rules);
    expect(result.dslRules).toBe(rules);
  });

  it.each([
    ['null', null],
    ['an empty string', ''],
  ])('update() sends %s to clear the rules', async (_label, dslRules) => {
    let receivedBody: Record<string, unknown> = {};
    server.use(
      http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
        receivedBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ data: { ...mockDocumentType, dslRules: null } });
      }),
    );

    const result = await new DocumentTypes(createClient()).update('dt-789', { dslRules });

    expect(receivedBody).toHaveProperty('dslRules', dslRules);
    expect(result.dslRules).toBeNull();
  });

  it('update() omits dslRules when not given, preserving the stored rules', async () => {
    let receivedBody: Record<string, unknown> = {};
    server.use(
      http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, async ({ request }) => {
        receivedBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ data: docTypeWithRules });
      }),
    );

    await new DocumentTypes(createClient()).update('dt-789', { name: 'Renamed', dslRules: undefined });

    expect(receivedBody).not.toHaveProperty('dslRules');
  });

  it('update() throws DSLValidationError with diagnostics when rules do not compile', async () => {
    server.use(
      http.put(`${TEST_BASE_URL}/api/document-types/dt-789`, () => HttpResponse.json(dslErrorBody, { status: 400 })),
    );

    const error = await new DocumentTypes(createClient())
      .update('dt-789', { dslRules: 'field.total greaterThen 0' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DSLValidationError);
    expect(error).toBeInstanceOf(BadRequestError);
    const dslError = error as DSLValidationError;
    expect(dslError.statusCode).toBe(400);
    expect(dslError.message).toBe(dslErrorBody.error);
    expect(dslError.diagnostics).toEqual(dslErrorBody.errors);
  });
});

describe('documentTypes.validate()', () => {
  function captureValidate(response: unknown = dryRunResult): { body: () => unknown } {
    let receivedBody: unknown;
    server.use(
      http.post(`${TEST_BASE_URL}/api/document-types/dt-789/validate`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(response);
      }),
    );
    return { body: () => receivedBody };
  }

  it('sends the data as the whole body without dslRules (stored rules)', async () => {
    const capture = captureValidate();

    await new DocumentTypes(createClient()).validate('dt-789', { total: 0 });

    expect(capture.body()).toEqual({ total: 0 });
  });

  it('sends the { data, dslRules } envelope for a dry-run', async () => {
    const capture = captureValidate();

    const result = await new DocumentTypes(createClient()).validate('dt-789', { total: 5 }, {
      dslRules: 'field.total greaterThan(10)',
    });

    expect(capture.body()).toEqual({ data: { total: 5 }, dslRules: 'field.total greaterThan(10)' });
    expect(result.valid).toBe(false);
    expect(result.issues?.[0]).toMatchObject({ field: 'total', source: 'rule', severity: 'error' });
    expect(result.errors.count).toBe(1);
  });

  it.each([
    ['null', null],
    ['an empty string', ''],
  ])('sends dslRules %s to test without DSL rules', async (_label, dslRules) => {
    const capture = captureValidate();

    await new DocumentTypes(createClient()).validate('dt-789', { total: 0 }, { dslRules });

    expect(capture.body()).toEqual({ data: { total: 0 }, dslRules });
  });

  it('throws DSLValidationError when temporary rules do not compile', async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/api/document-types/dt-789/validate`, () => HttpResponse.json(dslErrorBody, { status: 400 })),
    );

    const error = await new DocumentTypes(createClient())
      .validate('dt-789', { total: 1 }, { dslRules: 'field.total greaterThen 0' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DSLValidationError);
    expect((error as DSLValidationError).diagnostics[0]).toEqual({ line: 1, column: 13, message: dslErrorBody.errors[0].message });
  });

  it('withRawResponse.validate() sends the same body', async () => {
    const capture = captureValidate();

    const raw = await new DocumentTypes(createClient()).withRawResponse.validate('dt-789', { total: 5 }, { dslRules: rules });

    expect(raw.statusCode).toBe(200);
    expect(capture.body()).toEqual({ data: { total: 5 }, dslRules: rules });
  });

  it('isValidationValid() uses valid, falling back to errors.count', () => {
    expect(isValidationValid(dryRunResult)).toBe(false);
    expect(isValidationValid({ ...dryRunResult, valid: true })).toBe(true);
    expect(isValidationValid({ errors: { count: 0, messages: [] }, warnings: { count: 0, messages: [] } })).toBe(true);
    expect(isValidationValid({ errors: { count: 1, messages: ['x'] }, warnings: { count: 0, messages: [] } })).toBe(false);
  });
});

describe('conversion validation', () => {
  it('convert.run() returns validation and field_locations', async () => {
    const body: ConversionResult = {
      data: { total: 10 },
      validation: outcome,
      field_locations: {
        coordinate_space: 'page-relative',
        pages: [{ page: 1, width: 612, height: 792, unit: 'pt' }],
        fields: [{ path: '$.total', page: 1, box: { x0: 0.1, y0: 0.1, x1: 0.2, y1: 0.12 }, confidence: null }],
      },
    };
    server.use(http.post(`${TEST_BASE_URL}/api/convert`, () => HttpResponse.json(body)));

    const result = await new Convert(createClient()).run({ documentTypeCode: 'invoice', url: 'https://example.com/a.pdf' });

    expect(result.data).toEqual({ total: 10 });
    expect(isValidationOutcome(result.validation)).toBe(true);
    if (isValidationOutcome(result.validation)) {
      expect(result.validation.errors[0].source).toBe('schema');
    }
    expect(result.field_locations?.fields[0].path).toBe('$.total');
  });

  it.each<[string, ConversionValidation]>([
    ['an outcome', outcome],
    ['a system failure', { status: 'error' }],
    ['null (skipped)', null],
  ])('convert.getStatus() returns validation as %s', async (_label, validation) => {
    const status: ConversionStatus = { ...mockConversionStatus, validation };
    server.use(
      http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-123`, () => HttpResponse.json(status)),
    );

    const result = await new Convert(createClient()).getStatus('conv-123');

    expect(result.validation).toEqual(validation);
  });

  it('narrows ConversionValidation with the type guards', () => {
    expect(isValidationOutcome(outcome)).toBe(true);
    expect(isValidationSystemFailure(outcome)).toBe(false);
    expect(isValidationSystemFailure({ status: 'error' })).toBe(true);
    expect(isValidationOutcome({ status: 'error' })).toBe(false);
    expect(isValidationOutcome(null)).toBe(false);
    expect(isValidationSystemFailure(null)).toBe(false);
    expect(isValidationOutcome(undefined)).toBe(false);
  });

  it('types the CONVERSION_COMPLETED webhook payload', () => {
    const payload: ConversionWebhookPayload = {
      conversion_id: 'conv-123',
      status: 'SUCCESS',
      request_timestamp: '2025-01-01T00:00:00Z',
      document_type_code: 'invoice',
      original_filename: 'a.pdf',
      document_metadata: null,
      response_timestamp: '2025-01-01T00:00:01Z',
      data: { total: 10 },
      validation: outcome,
    };

    expect(isValidationOutcome(payload.validation)).toBe(true);
  });
});

describe('step validation', () => {
  it('keeps the { errors, warnings } summary shape', async () => {
    const validation = { errors: { count: 1, messages: ['x'] }, warnings: { count: 0, messages: [] } };
    server.use(
      http.get(`${TEST_BASE_URL}/api/steps-async/status/exec-abc`, () =>
        HttpResponse.json({ ...mockStepExecutionStatus, validation }),
      ),
    );

    const result = await new Steps(createClient()).getStatus('exec-abc');

    expect(result.validation).toEqual(validation);
    expect(result.validation?.errors.count).toBe(1);
  });
});
