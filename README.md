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
const client = new DocuTray(); // Reads from DOCUTRAY_API_KEY
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
const client = new DocuTray({ apiKey: 'your-api-key', maxRetries: 5 });

// Disable retries
const client = new DocuTray({ apiKey: 'your-api-key', maxRetries: 0 });
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
const result = await client.convert.run({
  url: 'https://example.com/invoice.pdf',
  documentTypeCode: 'invoice',
});

// Asynchronous conversion (returns immediately)
const status = await client.convert.runAsync({
  file: readFileSync('large_document.pdf'),
  documentTypeCode: 'invoice',
});
console.log(`Conversion ID: ${status.conversionId}`);

// Poll for completion
const final = await status.wait();
if (final.isSuccess()) {
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

const { validation } = await client.convert.run({ url, documentTypeCode: 'invoice' });

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
const result = await client.identify.run({
  file: readFileSync('unknown_document.pdf'),
});

console.log(`Identified as: ${result.documentType.name}`);
console.log(`Confidence: ${(result.documentType.confidence * 100).toFixed(1)}%`);

// View alternatives
for (const alt of result.alternatives) {
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
const page = await client.documentTypes.list({ search: 'invoice' });

// Get a specific document type
const docType = await client.documentTypes.get('dt_invoice');

// Validate data against a document type (JSON Schema + stored DSL rules)
const validation = await client.documentTypes.validate('dt_invoice', {
  invoice_number: 'INV-001',
  total: 100.0,
});
if (validation.valid) {
  console.log('Data is valid!');
}
```

#### Validation rules (DSL)

A document type validates extracted data in two layers: its JSON Schema and
optional business rules written in the
[validation DSL](https://docs.docutray.com/docs/guides/validation), stored in
`dslRules`. `get()`, `create()` and `update()` return `dslRules` (`null` when
the type has no rules); `list()` does not include it.

```typescript
// Save rules (64 KiB UTF-8 maximum)
await client.documentTypes.update('dt_invoice', {
  dslRules: 'define expected sum field.subtotal field.tax\nfield.total equalsWithPrecision(calculated.expected, 2)',
});

// In update(), omitting dslRules keeps the stored rules; null or '' clears them
await client.documentTypes.update('dt_invoice', { dslRules: null });
```

Test rules without saving them by passing `dslRules` to `validate()` (dry-run).
The JSON Schema still runs; `null` or `''` tests without rules. Without
`dslRules`, the stored rules run.

```typescript
const result = await client.documentTypes.validate(
  'dt_invoice',
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
  await client.documentTypes.update('dt_invoice', { dslRules: 'field.total greaterThen 0' });
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
const docType = await client.documentTypes.get('dt_invoice');
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
await client.documentTypes.update('dt_invoice', {
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
await client.documentTypes.update('dt_invoice', { conversionSpec: null });
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

// Wait for completion with progress callback
const final = await status.wait({
  onStatus: (s) => console.log(`Status: ${s.status}`),
});
console.log(final.data);
```

### Knowledge Bases

Manage document collections with semantic search capabilities.

```typescript
// List knowledge bases
for await (const kb of client.knowledgeBases.list().autoPagingIter()) {
  console.log(`${kb.name}: ${kb.documentCount} documents`);
}

// Create a knowledge base
const kb = await client.knowledgeBases.create({
  name: 'Product Documentation',
  description: 'Technical documentation for products',
});

// Add documents
const doc = await client.knowledgeBases.documents(kb.id).create({
  content: {
    title: 'Getting Started',
    content: 'Welcome to our product...',
    category: 'guides',
  },
  metadata: { source: 'manual' },
});

// Semantic search
const results = await client.knowledgeBases.search(kb.id, {
  query: 'how to configure authentication',
  limit: 5,
});
for (const item of results.data) {
  console.log(`${(item.similarity * 100).toFixed(1)}%: ${item.document.content.title}`);
}

// Delete knowledge base
await client.knowledgeBases.delete(kb.id);
```

## Pagination

Resources that return lists support pagination:

```typescript
// Get the first page
const page = await client.documentTypes.list({ limit: 10 });

// Iterate through all pages
for await (const page of client.documentTypes.list().iterPages()) {
  for (const docType of page.data) {
    console.log(docType.name);
  }
}

// Auto-iterate through all items
for await (const docType of client.documentTypes.list().autoPagingIter()) {
  console.log(docType.name);
}
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
console.log(`Request ID: ${response.headers['x-request-id']}`);

// Parse the response body
const result = response.parse();
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

if (final.isSuccess()) {
  console.log('Conversion complete!');
  console.log(final.data);
} else if (final.isFailed()) {
  console.error(`Conversion failed: ${final.error}`);
}
```

## Type Safety

The SDK is fully typed with TypeScript, providing complete type safety:

```typescript
import DocuTray from 'docutray';
import type { ConversionResult, DocumentType } from 'docutray';

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
