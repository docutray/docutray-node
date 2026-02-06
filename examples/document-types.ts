/**
 * Example: Document Types
 *
 * Demonstrates how to list, retrieve, and validate document type definitions.
 *
 * NOTE: Running this example will consume API credits.
 *
 * Usage: npx tsx examples/document-types.ts
 */

import DocuTray, { isValidationValid, hasValidationWarnings } from 'docutray';

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
  console.log('Schema:', JSON.stringify(dt.schema, null, 2));
}

async function validateDocumentType(id: string) {
  console.log(`\n--- Validate document type: ${id} ---`);

  const result = await client.documentTypes.validate(id);

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
    for (const msg of result.errors.messages) {
      console.log(`  - ${msg}`);
    }
  }
}

// Uncomment the function you want to run:
// listDocumentTypes();
// getDocumentType('dt_abc123');
// validateDocumentType('dt_abc123');
