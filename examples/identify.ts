/**
 * Example: Document Identification
 *
 * Demonstrates how to identify document types from images or PDFs.
 * Returns the best match with confidence score and alternative candidates.
 *
 * NOTE: Running this example will consume API credits.
 *
 * Usage: npx tsx examples/identify.ts
 */

import DocuTray, { isIdentificationSuccess } from 'docutray';

const client = new DocuTray();

async function identifyFromUrl() {
  console.log('--- Synchronous identification from URL ---');

  const result = await client.identify.run({
    url: 'https://example.com/document.pdf',
  });

  if (isIdentificationSuccess(result)) {
    console.log('Best match:', result.documentType?.name);
    console.log('Confidence:', result.documentType?.confidence);
    console.log('Alternatives:');
    for (const alt of result.alternatives ?? []) {
      console.log(`  - ${alt.name}: ${alt.confidence}`);
    }
  } else {
    console.log('Status:', result.status);
    if (result.error) console.error('Error:', result.error);
  }
}

async function identifyAsync() {
  console.log('\n--- Asynchronous identification with polling ---');

  const status = await client.identify.runAsync({
    url: 'https://example.com/document.pdf',
  });

  console.log('Identification enqueued:', status.identificationId);

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  if (isIdentificationSuccess(result)) {
    console.log('Best match:', result.documentType?.name);
    console.log('Confidence:', result.documentType?.confidence);
  } else {
    console.error('Identification failed:', result.error);
  }
}

// Uncomment the function you want to run:
// identifyFromUrl();
// identifyAsync();
