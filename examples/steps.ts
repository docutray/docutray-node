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

import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import DocuTray from 'docutray';

config({ path: new URL('.env', import.meta.url) });

const client = new DocuTray();

function getStepId(): string {
  const stepId = process.env.DOCUTRAY_STEP_ID;
  if (!stepId) {
    throw new Error('DOCUTRAY_STEP_ID not set in .env');
  }
  return stepId;
}

async function runStepFromFile() {
  const stepId = getStepId();
  console.log('--- Run step from file (async with polling) ---');
  console.log('Step ID:', stepId);

  const status = await client.steps.runAsync({
    stepId,
    file: readFileSync(new URL('sample_invoice.pdf', import.meta.url)),
    filename: 'sample_invoice.pdf',
  });

  console.log('Step execution enqueued:', status.id);

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  console.log('Final status:', result.status);
  console.log('Result:', JSON.stringify(result, null, 2));
}

async function runStepFromUrl() {
  const stepId = getStepId();
  console.log('--- Run step from URL (async with polling) ---');
  console.log('Step ID:', stepId);

  const status = await client.steps.runAsync({
    stepId,
    url: 'https://storage.googleapis.com/public.docutray.com/api-examples/sample_invoice.pdf',
  });

  console.log('Step execution enqueued:', status.id);

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  console.log('Final status:', result.status);
  console.log('Result:', JSON.stringify(result, null, 2));
}

async function runStepFromBase64() {
  const stepId = getStepId();
  console.log('--- Run step from base64 (async with polling) ---');
  console.log('Step ID:', stepId);

  const base64 = readFileSync(new URL('sample_invoice.pdf', import.meta.url)).toString('base64');

  const status = await client.steps.runAsync({
    stepId,
    base64,
    contentType: 'application/pdf',
  });

  console.log('Step execution enqueued:', status.id);

  const result = await status.wait({
    onStatus: (s) => console.log('  Polling...', s.status),
  });

  console.log('Final status:', result.status);
  console.log('Result:', JSON.stringify(result, null, 2));
}

// Run step from file (async with polling):
runStepFromFile();

// Uncomment for other examples:
// runStepFromUrl();
// runStepFromBase64();
