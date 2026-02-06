import { describe, it, expect, vi, afterEach } from 'vitest';
import { DocuTray } from '../src/client.js';
import { DocuTrayError } from '../src/core/error.js';
import { Convert } from '../src/resources/convert.js';
import { Identify } from '../src/resources/identify.js';
import { DocumentTypes } from '../src/resources/document-types.js';
import { Steps } from '../src/resources/steps.js';
import { KnowledgeBases } from '../src/resources/knowledge-bases.js';

describe('DocuTray', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('constructor', () => {
    it('accepts explicit apiKey', () => {
      const client = new DocuTray({ apiKey: 'sk-test' });
      expect(client).toBeInstanceOf(DocuTray);
    });

    it('falls back to DOCUTRAY_API_KEY env var', () => {
      vi.stubEnv('DOCUTRAY_API_KEY', 'sk-env');
      const client = new DocuTray();
      expect(client).toBeInstanceOf(DocuTray);
    });

    it('explicit apiKey takes precedence over env var', () => {
      vi.stubEnv('DOCUTRAY_API_KEY', 'sk-env');
      const client = new DocuTray({ apiKey: 'sk-explicit' });
      expect(client).toBeInstanceOf(DocuTray);
    });

    it('throws DocuTrayError when no API key is provided', () => {
      vi.stubEnv('DOCUTRAY_API_KEY', '');
      expect(() => new DocuTray()).toThrow(DocuTrayError);
    });

    it('throws with descriptive message when no API key', () => {
      vi.stubEnv('DOCUTRAY_API_KEY', '');
      expect(() => new DocuTray()).toThrow(/DOCUTRAY_API_KEY/);
    });

    it('accepts custom baseURL and timeout', () => {
      const client = new DocuTray({
        apiKey: 'sk-test',
        baseURL: 'https://custom.api',
        timeout: 30000,
      });
      expect(client).toBeInstanceOf(DocuTray);
    });
  });

  describe('resource properties', () => {
    const client = new DocuTray({ apiKey: 'sk-test' });

    it('exposes convert as Convert instance', () => {
      expect(client.convert).toBeInstanceOf(Convert);
    });

    it('exposes identify as Identify instance', () => {
      expect(client.identify).toBeInstanceOf(Identify);
    });

    it('exposes documentTypes as DocumentTypes instance', () => {
      expect(client.documentTypes).toBeInstanceOf(DocumentTypes);
    });

    it('exposes steps as Steps instance', () => {
      expect(client.steps).toBeInstanceOf(Steps);
    });

    it('exposes knowledgeBases as KnowledgeBases instance', () => {
      expect(client.knowledgeBases).toBeInstanceOf(KnowledgeBases);
    });
  });
});
