/**
 * Example: Document Conversion
 *
 * Demonstrates how to convert documents to structured data using the DocuTray API.
 * Supports file upload, URL, and base64 input methods.
 *
 * NOTE: Running this example will consume API credits.
 *
 * Usage: npx tsx examples/convert.ts
 */

import { config } from 'dotenv';
import { readFileSync } from 'node:fs';

config({ path: new URL('.env', import.meta.url) });
import DocuTray from 'docutray';

const client = new DocuTray();

async function convertFromFile() {
  console.log('--- Synchronous conversion from file ---');

  const result = await client.convert.run({
    documentTypeCode: 'invoice',
    file: readFileSync(new URL('sample_invoice.pdf', import.meta.url)),
    filename: 'sample_invoice.pdf',
  });

  if (result.data) {
    console.log('Conversion successful!');
    console.log('Extracted data:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('Status:', result.status);
    if (result.error) console.error('Error:', result.error);
  }
}

async function convertFromUrl() {
  console.log('--- Synchronous conversion from URL ---');

  const result = await client.convert.run({
    documentTypeCode: 'invoice',
    url: 'https://storage.googleapis.com/public.docutray.com/api-examples/sample_invoice.pdf',
  });

  if (result.data) {
    console.log('Conversion successful!');
    console.log('Extracted data:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('Status:', result.status);
    if (result.error) console.error('Error:', result.error);
  }
}

async function convertAsync() {
  console.log('--- Asynchronous conversion with polling ---');

  const status = await client.convert.runAsync({
    documentTypeCode: 'invoice',
    url: 'https://storage.googleapis.com/public.docutray.com/api-examples/sample_invoice.pdf',
  });

  console.log('Enqueued:', JSON.stringify(status, null, 2));

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  console.log('Final:', JSON.stringify(result, null, 2));
}

async function convertFromBase64() {
  console.log('--- Synchronous conversion from base64 ---');

  const base64 = readFileSync(new URL('sample_invoice.pdf', import.meta.url)).toString('base64');

  const result = await client.convert.run({
    documentTypeCode: 'invoice',
    base64,
    contentType: 'application/pdf',
  });

  if (result.data) {
    console.log('Conversion successful!');
    console.log('Extracted data:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('Status:', result.status);
    if (result.error) console.error('Error:', result.error);
  }
}

async function main() {
  // Run the file conversion example (sync):
  await convertFromFile();

  // Uncomment for other examples:
  // await convertFromUrl();
  // await convertFromBase64();
  // await convertAsync();
}

main().catch(console.error);
