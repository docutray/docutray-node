# DocuTray Node.js Library

[![CI](https://github.com/docutray/docutray-node/actions/workflows/ci.yml/badge.svg)](https://github.com/docutray/docutray-node/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/docutray.svg)](https://www.npmjs.com/package/docutray)
[![License](https://img.shields.io/npm/l/docutray.svg)](https://github.com/docutray/docutray-node/blob/main/LICENSE)

The official Node.js library for the [DocuTray API](https://docutray.com), providing access to document processing capabilities including OCR, document identification, data extraction, and knowledge bases.

## Documentation

Full API documentation is available at [docs.docutray.com](https://docs.docutray.com).

## Installation

```bash
npm install docutray
```

### Requirements

- Node.js 20+

## Quick Start

```typescript
import DocuTray from 'docutray';
import { readFileSync } from 'fs';

const client = new DocuTray({ apiKey: 'your-api-key' });

// Convert a document
const result = await client.convert.run({
  file: readFileSync('invoice.pdf'),
  documentTypeCode: 'invoice',
});
console.log(result.data);
```

## Configuration

### API Key

Set your API key via constructor argument or environment variable:

```typescript
// Via constructor
const client = new DocuTray({ apiKey: 'your-api-key' });

// Via environment variable
// export DOCUTRAY_API_KEY="your-api-key"
const envClient = new DocuTray(); // Reads from DOCUTRAY_API_KEY
```

### Base URL

Override the default API endpoint:

```typescript
const client = new DocuTray({
  apiKey: 'your-api-key',
  baseURL: 'https://custom-api.example.com',
});
```

### Timeout

Configure request timeouts (in milliseconds):

```typescript
const client = new DocuTray({
  apiKey: 'your-api-key',
  timeout: 30_000, // 30 seconds
});
```

### Retries

Configure automatic retry behavior:

```typescript
// Default: 2 retries with exponential backoff
const client = new DocuTray({ apiKey: 'your-api-key' });

// Custom retry count
const patientClient = new DocuTray({ apiKey: 'your-api-key', maxRetries: 5 });

// Disable retries
const noRetryClient = new DocuTray({ apiKey: 'your-api-key', maxRetries: 0 });
```

## Error Handling

The SDK provides a comprehensive error hierarchy:

```
DocuTrayError (base)
├── APIConnectionError (network errors)
│   └── APITimeoutError (request timeout)
└── APIError (HTTP errors)
    ├── BadRequestError (400)
    │   └── DSLValidationError (400, DSL rules that do not compile)
    ├── AuthenticationError (401)
    ├── PermissionDeniedError (403)
    ├── NotFoundError (404)
    ├── ConflictError (409)
    ├── UnprocessableEntityError (422)
    ├── RateLimitError (429)
    └── InternalServerError (5xx)
```

### Catching Errors

```typescript
import DocuTray, {
  DocuTrayError,
  APIConnectionError,
  APIError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
} from 'docutray';
import { readFileSync } from 'fs';

const client = new DocuTray({ apiKey: 'your-api-key' });

try {
  const result = await client.convert.run({
    file: readFileSync('document.pdf'),
    documentTypeCode: 'invoice',
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error(`Invalid API key: ${error.message}`);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof NotFoundError) {
    console.error(`Resource not found: ${error.message}`);
  } else if (error instanceof APIError) {
    console.error(`API error ${error.statusCode}: ${error.message}`);
    console.error(`Request ID: ${error.requestId}`);
  } else if (error instanceof APIConnectionError) {
    console.error(`Connection failed: ${error.message}`);
  } else if (error instanceof DocuTrayError) {
    console.error(`SDK error: ${error.message}`);
  }
}
```

## Resources

### Convert

Convert documents to structured data using OCR and AI extraction.

```typescript
import { readFileSync } from 'fs';

// Synchronous conversion (waits for result)
const result = await client.convert.run({
  file: readFileSync('invoice.pdf'),
  documentTypeCode: 'invoice',
});
console.log(result.data);
console.log(result.validation);      // see "Conversion validation" below
console.log(result.field_locations); // only when the type has boundingBoxesEnabled

// From URL
const fromUrl = await client.convert.run({
  url: 'https://example.com/invoice.pdf',
  documentTypeCode: 'invoice',
});

// Asynchronous conversion (returns immediately)
const status = await client.convert.runAsync({
  file: readFileSync('large_document.pdf'),
  documentTypeCode: 'invoice',
});
console.log(`Conversion ID: ${status.conversion_id}`);

// Poll until the conversion reaches SUCCESS or ERROR
const final = await status.wait();
if (final.status === 'SUCCESS') {
  console.log(final.data);
}
```

#### Conversion validation

Successful conversions (`convert.run()`, `convert.getStatus()` with status
`SUCCESS`, and the `CONVERSION_COMPLETED` webhook) carry a `validation` field of
type `ConversionValidation`. Validation is informational: it never changes the
conversion status.

```typescript
import { isValidationOutcome, isValidationSystemFailure } from 'docutray';

const { validation } = await client.convert.run({
  url: 'https://example.com/invoice.pdf',
  documentTypeCode: 'invoice',
});

if (isValidationOutcome(validation)) {
  // Validation ran: { valid, errors: ValidationIssue[], warnings: ValidationIssue[] }
  if (!validation.valid) console.log(validation.errors);
} else if (isValidationSystemFailure(validation)) {
  // { status: 'error' }: validation could not be completed. It does not mean the
  // data is invalid; re-check later with documentTypes.validate().
} else {
  // null: skipped, the document type has no JSON Schema and no rules
}
```

Webhook receivers can type the request body with `ConversionWebhookPayload`
(the event type arrives in the `X-Docutray-Event` header). Step executions keep
the summary format: `validation` is `{ errors: { count, messages }, warnings: { count, messages } }`.

### Identify

Automatically identify document types.

```typescript
// documentTypeCodeOptions is required: the codes to choose from
const result = await client.identify.run({
  file: readFileSync('unknown_document.pdf'),
  documentTypeCodeOptions: ['invoice', 'receipt', 'contract'],
  documentMetadata: { source: 'inbox' }, // optional, echoed in identification webhooks only
});

// When the document matches none of the options, the code is 'otro'
console.log(`Identified as: ${result.document_type.name} (${result.document_type.code})`);
console.log(`Confidence: ${(result.document_type.confidence * 100).toFixed(1)}%`);

// View alternatives
for (const alt of result.alternatives ?? []) {
  console.log(`  Alternative: ${alt.name} (${(alt.confidence * 100).toFixed(1)}%)`);
}
```

### Document Types

List and retrieve document type definitions.

```typescript
// List all document types
const page = await client.documentTypes.list();
for (const docType of page.data) {
  console.log(`${docType.codeType}: ${docType.name}`);
}

// Search document types
const searchResults = await client.documentTypes.list({ search: 'invoice' });

// Get a specific document type by its id
const docType = await client.documentTypes.get('YOUR_DOCUMENT_TYPE_ID');

// Validate data against a document type (JSON Schema + stored DSL rules)
const validation = await client.documentTypes.validate('YOUR_DOCUMENT_TYPE_ID', {
  invoice_number: 'INV-001',
  total: 100.0,
});
if (validation.valid) {
  console.log('Data is valid!');
}
```

> `get()`, `update()` and `validate()` take the document type's internal `id`
> (a cuid such as `cm…`), not its `codeType`. The SDK does
> not resolve codes: passing a `codeType` such as `'invoice'` returns a
> `NotFoundError` (404). Resolve the code to an id with `list()` first:
>
> ```typescript
> // `search` also matches names and descriptions, so check every page
> const matches = await client.documentTypes.list({ search: 'invoice' });
> for await (const dt of matches.autoPagingIter()) {
>   if (dt.codeType === 'invoice') {
>     const docType = await client.documentTypes.get(dt.id);
>     break;
>   }
> }
> ```

#### Validation rules (DSL)

A document type validates extracted data in two layers: its JSON Schema and
optional business rules written in the
[validation DSL](https://docs.docutray.com/docs/guides/validation), stored in
`dslRules`. `get()`, `create()` and `update()` return `dslRules` (`null` when
the type has no rules); `list()` does not include it.

```typescript
// Save rules (64 KiB UTF-8 maximum)
await client.documentTypes.update('YOUR_DOCUMENT_TYPE_ID', {
  dslRules: 'define expected sum field.subtotal field.tax\nfield.total equalsWithPrecision(calculated.expected, 2)',
});

// In update(), omitting dslRules keeps the stored rules; null or '' clears them
await client.documentTypes.update('YOUR_DOCUMENT_TYPE_ID', { dslRules: null });
```

Test rules without saving them by passing `dslRules` to `validate()` (dry-run).
The JSON Schema still runs; `null` or `''` tests without rules. Without
`dslRules`, the stored rules run.

```typescript
const result = await client.documentTypes.validate(
  'YOUR_DOCUMENT_TYPE_ID',
  { subtotal: 1000, tax: 190, total: 1290 },
  { dslRules: 'field.total lessThan(1000)' },
);

result.valid;          // false — authoritative; warnings never make it invalid
result.issues;         // ValidationIssue[]: errors first, then warnings
result.errors.count;   // summary kept for compatibility: { count, messages }
for (const issue of result.issues ?? []) {
  console.log(issue.field, issue.code, issue.source, issue.message);
}
```

Each `ValidationIssue` has `field` (path such as `items[1].amount`; `''` is the
document root), `code`, `message`, `severity` (`error` | `warning`), `source`
(`schema` | `rule`) and, when available, `rule`, `value` and `details`. Issue
messages are written in Spanish by the API.

Rules that fail to compile throw a `DSLValidationError` (a `BadRequestError`)
from `create()`, `update()` or a `validate()` dry-run, with the line and column
of each problem. Nothing is saved.

```typescript
import { DSLValidationError } from 'docutray';

try {
  await client.documentTypes.update('YOUR_DOCUMENT_TYPE_ID', { dslRules: 'field.total greaterThen 0' });
} catch (error) {
  if (error instanceof DSLValidationError) {
    for (const d of error.diagnostics) {
      console.error(`line ${d.line}, column ${d.column}: ${d.message}`);
    }
  }
}
```

> `validate()` takes the document data as its second argument. Earlier SDK
> versions sent no body, which the API rejects.

#### Conversion specs

A document type can carry a `conversionSpec`: the mapping from extracted JSON to
CSV/Excel columns used by tray export. It comes in two formats — legacy
(top-level `columns`) and multi-sheet (top-level `sheets`).

```typescript
import { isMultiSheetConversionSpec } from 'docutray';

// Read the stored spec (null when the document type has none)
const docType = await client.documentTypes.get('YOUR_DOCUMENT_TYPE_ID');
if (isMultiSheetConversionSpec(docType.conversionSpec)) {
  console.log(docType.conversionSpec.sheets.map((sheet) => sheet.name));
}

// Create with a legacy spec
await client.documentTypes.create({
  name: 'Invoice',
  codeType: 'invoice',
  description: 'Standard invoice',
  jsonSchema: { type: 'object' },
  conversionSpec: {
    columns: [
      { header: 'Invoice Number', jsonPath: '$.invoice_number' },
      { header: 'Total', jsonPath: '$.total_amount' },
    ],
  },
});

// Update with a multi-sheet spec
await client.documentTypes.update('YOUR_DOCUMENT_TYPE_ID', {
  conversionSpec: {
    sheets: [
      {
        name: 'Header',
        columns: [{ header: 'Invoice Number', jsonPath: '$.invoice_number' }],
      },
      {
        name: 'Line Items',
        columns: [
          { header: 'SKU', jsonPath: '$.items[*].sku' },
          { header: 'Amount', type: 'formula', formula: '=B2*C2' },
        ],
      },
    ],
  },
});

// Omit conversionSpec to leave the stored spec untouched; pass null to clear it
await client.documentTypes.update('YOUR_DOCUMENT_TYPE_ID', { conversionSpec: null });
```

When forwarding a spec read from a document type, pass it straight through —
`undefined` is dropped from the request body, so the stored spec is left alone:

```typescript
// Safe: omits the key when the source has no conversionSpec
await client.documentTypes.update(docType.id, {
  name: 'Renamed',
  conversionSpec: docType.conversionSpec,
});
```

> **Do not normalize with `?? null`.** Document types from `list()` — and from
> API deployments predating the field — carry no `conversionSpec`, so
> `conversionSpec: docType.conversionSpec ?? null` would turn "not loaded" into
> "clear the stored spec" and silently discard it.

The SDK does not validate specs client-side — the API does. A structurally
invalid spec is rejected with a `BadRequestError` carrying the API's message,
and nothing is persisted.

> `conversionSpec` requires an API deployment that includes
> [docutray#972](https://github.com/docutray/docutray/pull/972). Older
> deployments omit the field on read and ignore it on write.

### Steps

Execute predefined document processing workflows.

```typescript
// Start async step execution
const status = await client.steps.runAsync({
  stepId: 'step_invoice_extraction',
  file: readFileSync('invoice.pdf'),
});
console.log(`Execution ID: ${status.id}`); // getStatus(id) returns it as execution_id

// Wait for completion with progress callback
const final = await status.wait({
  onStatus: (s) => console.log(`Status: ${s.status}`),
});
if (final.status === 'SUCCESS') {
  console.log(final.data);
} else {
  console.error('Step failed:', final.error?.message);
}
```

Webhooks are configured per organization in DocuTray, not per request. Type
their bodies with `ConversionWebhookPayload`, `IdentificationWebhookPayload`
and `StepWebhookPayload` (the event type arrives in the `X-Docutray-Event`
header).

### Knowledge Bases

Manage document collections with semantic search capabilities.

```typescript
// List knowledge bases
const kbPage = await client.knowledgeBases.list();
for await (const kb of kbPage.autoPagingIter()) {
  console.log(`${kb.name}: ${kb._count?.documents ?? 0} documents`);
}

// Create a knowledge base (name, description and schema are required)
const kb = await client.knowledgeBases.create({
  name: 'Product Documentation',
  description: 'Technical documentation for products',
  schema: { type: 'object', properties: { title: { type: 'string' } } },
});

// Add documents. documentId is your own identifier, unique within the
// knowledge base; get(), update() and delete() take it instead of `id`.
const docs = client.knowledgeBases.documents(kb.id);
const doc = await docs.create({
  documentId: 'getting-started',
  content: {
    title: 'Getting Started',
    content: 'Welcome to our product...',
    category: 'guides',
  },
  metadata: { source: 'manual' },
});
const sameDoc = await docs.get('getting-started');

// Semantic search
const results = await client.knowledgeBases.search(kb.id, {
  query: 'how to configure authentication',
  limit: 5,
  similarityThreshold: 0.6, // default 0.7
});
for (const item of results.data) {
  console.log(`${(item.similarity * 100).toFixed(1)}%: ${item.document.content.title}`);
}

// Regenerate embeddings. sync() waits until it finishes and is not retried
// by default; pass a longer timeout for large knowledge bases
await client.knowledgeBases.sync(kb.id, { force: true }, { timeout: 600_000 });

// Delete knowledge base (soft delete: update(kb.id, { isActive: true }) restores it)
await client.knowledgeBases.delete(kb.id);
```

## Pagination

Resources that return lists support pagination:

```typescript
// Get the first page (list() returns a Promise<Page<T>>)
const firstPage = await client.documentTypes.list({ limit: 10 });
console.log(firstPage.data.length, firstPage.hasNextPage());

// Pick one of the following ways to walk the rest: each one fetches every
// remaining page again.

// a) Iterate through all pages, starting from this one
for await (const page of firstPage.iterPages()) {
  for (const docType of page.data) {
    console.log(docType.name);
  }
}

// b) Or auto-iterate through all items across pages
for await (const docType of firstPage.autoPagingIter()) {
  console.log(docType.name);
}

// c) Or collect items into an array, up to a limit
const all = await firstPage.toArray({ limit: 100 });
```

## Raw Response Access

Access raw HTTP response data for debugging:

```typescript
const response = await client.convert.withRawResponse.run({
  file: readFileSync('invoice.pdf'),
  documentTypeCode: 'invoice',
});

console.log(`Status: ${response.statusCode}`);
console.log(`Headers:`, response.headers);
console.log(`Request ID: ${response.headers.get('x-request-id')}`); // headers is a fetch Headers object

// Parse the response body (async, cached after the first call)
const result = await response.parse();
console.log(result.data);
```

## Async Operations

For long-running operations, use async methods with polling:

```typescript
// Start async conversion
const status = await client.convert.runAsync({
  file: readFileSync('large_document.pdf'),
  documentTypeCode: 'invoice',
});

// Poll with progress callback
const final = await status.wait({
  onStatus: (s) => console.log(`Status: ${s.status}`),
  pollInterval: 2000,  // ms between polls
  timeout: 300_000,    // maximum wait time in ms
});

if (final.status === 'SUCCESS') {
  console.log('Conversion complete!');
  console.log(final.data);
} else if (final.status === 'ERROR') {
  console.error(`Conversion failed: ${final.error}`);
}
```

`wait()` resolves with the final status object once the operation reaches
`SUCCESS` or `ERROR`; check `status` (or use `isConversionSuccess()` /
`isConversionError()`) to tell them apart. It rejects with an `APITimeoutError`
when `timeout` has elapsed; the check runs after each poll interval, so the
rejection can come up to one `pollInterval` later. It also rejects with any
error raised by a status poll itself (for example `NotFoundError`, a
`RateLimitError` after retries, or `APIConnectionError`).

## Type Safety

The SDK is fully typed with TypeScript, providing complete type safety:

```typescript
import DocuTray from 'docutray';
import type { ConversionResult, DocumentType } from 'docutray';
import { readFileSync } from 'fs';

const client = new DocuTray({ apiKey: 'your-api-key' });

// Type hints work with your IDE
const result: ConversionResult = await client.convert.run({
  file: readFileSync('invoice.pdf'),
  documentTypeCode: 'invoice',
});

// Access typed attributes
console.log(result.data);       // Record<string, unknown>
console.log(result.validation); // ConversionValidation | undefined
```

## Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/docutray/docutray-node.git
cd docutray-node

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

## Support

- [Documentation](https://docs.docutray.com)
- [API Reference](https://docs.docutray.com/api)
- [Issue Tracker](https://github.com/docutray/docutray-node/issues)

## License

MIT
