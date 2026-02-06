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

import DocuTray, { isConversionSuccess } from 'docutray';

const client = new DocuTray();

async function convertFromUrl() {
  console.log('--- Synchronous conversion from URL ---');

  const result = await client.convert.run({
    documentTypeCode: 'invoice',
    url: 'https://example.com/invoice.pdf',
  });

  if (isConversionSuccess(result)) {
    console.log('Conversion successful!');
    console.log('Extracted data:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('Status:', result.status);
    if (result.error) console.error('Error:', result.error);
  }
}

async function convertAsync() {
  console.log('\n--- Asynchronous conversion with polling ---');

  const status = await client.convert.runAsync({
    documentTypeCode: 'invoice',
    url: 'https://example.com/invoice.pdf',
  });

  console.log('Conversion enqueued:', status.conversionId);

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  if (isConversionSuccess(result)) {
    console.log('Conversion successful!');
    console.log('Extracted data:', JSON.stringify(result.data, null, 2));
  } else {
    console.error('Conversion failed:', result.error);
  }
}

// Uncomment the function you want to run:
// convertFromUrl();
// convertAsync();

// Alternative: conversion from file
// import { readFileSync } from 'node:fs';
//
// const result = await client.convert.run({
//   documentTypeCode: 'invoice',
//   file: readFileSync('invoice.pdf'),
//   filename: 'invoice.pdf',
// });
