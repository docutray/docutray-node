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

import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import DocuTray from 'docutray';

config({ path: new URL('.env', import.meta.url) });

const client = new DocuTray();

async function identifyFromFile() {
  console.log('--- Synchronous identification from file ---');

  const result = await client.identify.run({
    file: readFileSync(new URL('sample_invoice.pdf', import.meta.url)),
    filename: 'sample_invoice.pdf',
    documentTypeCodeOptions: ['invoice'],
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

async function identifyFromUrl() {
  console.log('--- Synchronous identification from URL ---');

  const result = await client.identify.run({
    url: 'https://storage.googleapis.com/public.docutray.com/api-examples/sample_invoice.pdf',
    documentTypeCodeOptions: ['invoice'],
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

async function identifyAsync() {
  console.log('--- Asynchronous identification with polling ---');

  const status = await client.identify.runAsync({
    url: 'https://storage.googleapis.com/public.docutray.com/api-examples/sample_invoice.pdf',
    documentTypeCodeOptions: ['invoice'],
  });

  console.log('Enqueued:', JSON.stringify(status, null, 2));

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  console.log('Final:', JSON.stringify(result, null, 2));
}

async function identifyFromBase64() {
  console.log('--- Synchronous identification from base64 ---');

  const base64 = readFileSync(new URL('sample_invoice.pdf', import.meta.url)).toString('base64');

  const result = await client.identify.run({
    base64,
    contentType: 'application/pdf',
    documentTypeCodeOptions: ['invoice'],
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

// Run the file identification example (sync):
identifyFromFile();

// Uncomment for other examples:
// identifyFromUrl();
// identifyFromBase64();
// identifyAsync();
