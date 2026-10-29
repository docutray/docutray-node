import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { VERSION } from '../../src/lib/version.js';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { createTestClient, TEST_BASE_URL } from '../helpers/fixtures.js';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };

describe('VERSION', () => {
  it('matches package.json', () => {
    expect(VERSION).toBe(pkg.version);
  });

  it('is sent in the User-Agent header', async () => {
    let userAgent: string | null = null;
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types/dt-1`, ({ request }) => {
        userAgent = request.headers.get('user-agent');
        return HttpResponse.json({ data: {} });
      }),
    );

    await createTestClient().get('/api/document-types/dt-1');

    expect(userAgent).toBe(`docutray-node/${pkg.version}`);
  });
});
