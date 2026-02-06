/**
 * Example: Processing Steps
 *
 * Demonstrates how to run predefined processing steps on documents.
 * Steps are always asynchronous and return a status with a wait() method.
 *
 * NOTE: Running this example will consume API credits.
 *
 * Usage: npx tsx examples/steps.ts
 */

import DocuTray, { isStepExecutionSuccess } from 'docutray';

const client = new DocuTray();

async function runStep() {
  console.log('--- Run a processing step ---');

  const status = await client.steps.runAsync({
    stepId: 'ocr-extract',
    url: 'https://example.com/document.pdf',
  });

  console.log('Step execution enqueued:', status.executionId);

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  if (isStepExecutionSuccess(result)) {
    console.log('Step completed successfully!');
    console.log('Result:', JSON.stringify(result.data, null, 2));
  } else {
    console.error('Step failed:', result.error);
  }
}

// Uncomment to run:
// runStep();

// Alternative: run step from file
// import { readFileSync } from 'node:fs';
//
// const status = await client.steps.runAsync({
//   stepId: 'ocr-extract',
//   file: readFileSync('document.pdf'),
//   filename: 'document.pdf',
// });
