/**
 * Example: Document Types
 *
 * Demonstrates how to list, retrieve, and validate data against document type definitions.
 *
 * NOTE: Running this example will consume API credits.
 *
 * Usage: npx tsx examples/document-types.ts
 */

import { config } from 'dotenv';
import DocuTray, { isValidationValid, hasValidationWarnings } from 'docutray';

config({ path: new URL('.env', import.meta.url) });

const client = new DocuTray();

async function listDocumentTypes() {
  console.log('--- List document types ---');

  const page = await client.documentTypes.list({ limit: 10 });
  console.log(`Found ${page.data.length} document types on this page`);

  for (const dt of page.data) {
    console.log(`  - ${dt.name} (${dt.codeType}) [${dt.isPublic ? 'public' : 'private'}]`);
  }

  // Auto-paginate through all pages
  if (page.hasNextPage()) {
    console.log('\nIterating all pages...');
    const all = await page.toArray({ limit: 100 });
    console.log(`Total document types: ${all.length}`);
  }
}

async function getDocumentType(id: string) {
  console.log(`\n--- Get document type: ${id} ---`);

  const dt = await client.documentTypes.get(id);
  console.log('Name:', dt.name);
  console.log('Code:', dt.codeType);
  console.log('Description:', dt.description);
  console.log('Schema:', JSON.stringify(dt.jsonSchema, null, 2));
}

async function validateDocumentType(id: string) {
  console.log(`\n--- Validate data against document type: ${id} ---`);

  const data = { invoice_number: 'INV-001', subtotal: 1000, tax: 190, total: 1290 };

  // Validate with the stored JSON Schema and DSL rules
  const result = await client.documentTypes.validate(id, data);

  if (isValidationValid(result)) {
    console.log('Validation passed!');
    if (hasValidationWarnings(result)) {
      console.log(`Warnings (${result.warnings.count}):`);
      for (const msg of result.warnings.messages) {
        console.log(`  - ${msg}`);
      }
    }
  } else {
    console.log(`Validation failed with ${result.errors.count} error(s):`);
    for (const issue of result.issues ?? []) {
      console.log(`  - [${issue.severity}/${issue.source}] ${issue.field || '(root)'}: ${issue.message}`);
    }
  }

  // Dry-run: test temporary rules without saving them
  const dryRun = await client.documentTypes.validate(id, data, {
    dslRules: 'define expected sum field.subtotal field.tax\nfield.total equalsWithPrecision(calculated.expected, 2)',
  });
  console.log(`Dry-run with temporary rules: ${dryRun.valid ? 'valid' : 'invalid'}`);
}

// Uncomment the function you want to run.
// get() and validate() take the document type id (a cuid), not its codeType:
// find the id with listDocumentTypes() first.
// listDocumentTypes();
// getDocumentType('cmditbp6h000zrq01jl0whzcr');
// validateDocumentType('cmditbp6h000zrq01jl0whzcr');
