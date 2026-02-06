import { describe, it, expect } from 'vitest';
import {
  detectContentType,
  prepareFileUpload,
  prepareUrlUpload,
  prepareBase64Upload,
} from '../../src/lib/files.js';

describe('detectContentType', () => {
  it('detects PDF', () => {
    expect(detectContentType('invoice.pdf')).toBe('application/pdf');
  });

  it('detects JPEG (.jpg)', () => {
    expect(detectContentType('photo.jpg')).toBe('image/jpeg');
  });

  it('detects JPEG (.jpeg)', () => {
    expect(detectContentType('photo.jpeg')).toBe('image/jpeg');
  });

  it('detects PNG', () => {
    expect(detectContentType('image.png')).toBe('image/png');
  });

  it('detects GIF', () => {
    expect(detectContentType('animation.gif')).toBe('image/gif');
  });

  it('detects BMP', () => {
    expect(detectContentType('image.bmp')).toBe('image/bmp');
  });

  it('detects WebP', () => {
    expect(detectContentType('image.webp')).toBe('image/webp');
  });

  it('detects TIFF (.tiff)', () => {
    expect(detectContentType('scan.tiff')).toBe('image/tiff');
  });

  it('detects TIFF (.tif)', () => {
    expect(detectContentType('scan.tif')).toBe('image/tiff');
  });

  it('is case-insensitive for extensions', () => {
    expect(detectContentType('FILE.PDF')).toBe('application/pdf');
    expect(detectContentType('PHOTO.JPG')).toBe('image/jpeg');
  });

  it('returns application/octet-stream for unknown extension', () => {
    expect(detectContentType('data.xyz')).toBe('application/octet-stream');
  });

  it('returns application/octet-stream for no extension', () => {
    expect(detectContentType('document')).toBe('application/octet-stream');
  });

  it('handles filenames with multiple dots', () => {
    expect(detectContentType('my.document.v2.pdf')).toBe('application/pdf');
  });
});

describe('prepareFileUpload', () => {
  it('handles Buffer input', () => {
    const buffer = Buffer.from('fake pdf content');
    const result = prepareFileUpload(buffer);

    expect(result.formData).toBeInstanceOf(FormData);
    expect(result.contentType).toBe('application/pdf');
    const file = result.formData.get('image') as File;
    expect(file).toBeTruthy();
    expect(file.type).toBe('application/pdf');
  });

  it('handles Buffer with custom filename', () => {
    const buffer = Buffer.from('fake png');
    const result = prepareFileUpload(buffer, { filename: 'photo.png' });

    expect(result.contentType).toBe('image/png');
    const file = result.formData.get('image') as File;
    expect(file.name).toBe('photo.png');
    expect(file.type).toBe('image/png');
  });

  it('handles Buffer with explicit contentType', () => {
    const buffer = Buffer.from('data');
    const result = prepareFileUpload(buffer, {
      filename: 'doc',
      contentType: 'application/pdf',
    });

    expect(result.contentType).toBe('application/pdf');
  });

  it('handles ArrayBuffer input', () => {
    const arrayBuffer = new ArrayBuffer(8);
    const result = prepareFileUpload(arrayBuffer);

    expect(result.formData).toBeInstanceOf(FormData);
    expect(result.contentType).toBe('application/pdf');
    const file = result.formData.get('image') as File;
    expect(file.type).toBe('application/pdf');
  });

  it('handles Blob input and infers type from Blob', () => {
    const blob = new Blob(['content'], { type: 'image/jpeg' });
    const result = prepareFileUpload(blob);

    expect(result.formData).toBeInstanceOf(FormData);
    expect(result.contentType).toBe('image/jpeg');
    const file = result.formData.get('image') as File;
    expect(file.type).toBe('image/jpeg');
  });

  it('uses default content type for Blob without type', () => {
    const blob = new Blob(['content']);
    const result = prepareFileUpload(blob);

    expect(result.contentType).toBe('application/pdf');
  });

  it('handles Blob with filename for content-type detection', () => {
    const blob = new Blob(['content']);
    const result = prepareFileUpload(blob, { filename: 'scan.tiff' });

    expect(result.contentType).toBe('image/tiff');
  });

  it('handles FileWithMetadata', () => {
    const result = prepareFileUpload({
      content: Buffer.from('pdf data'),
      filename: 'invoice.pdf',
    });

    expect(result.formData).toBeInstanceOf(FormData);
    expect(result.contentType).toBe('application/pdf');
    const file = result.formData.get('image') as File;
    expect(file.name).toBe('invoice.pdf');
    expect(file.type).toBe('application/pdf');
  });

  it('handles FileWithMetadata with explicit contentType', () => {
    const result = prepareFileUpload({
      content: new Blob(['data']),
      filename: 'file',
      contentType: 'image/png',
    });

    expect(result.contentType).toBe('image/png');
  });

  it('uses default filename "document" when none provided', () => {
    const buffer = Buffer.from('data');
    const result = prepareFileUpload(buffer);

    const file = result.formData.get('image') as File;
    expect(file.name).toBe('document');
  });

  it('infers name and type from File object', () => {
    const file = new File(['data'], 'receipt.png', { type: 'image/png' });
    const result = prepareFileUpload(file);

    expect(result.contentType).toBe('image/png');
    const entry = result.formData.get('image') as File;
    expect(entry.name).toBe('receipt.png');
    expect(entry.type).toBe('image/png');
  });

  it('prefers options over File inferred values', () => {
    const file = new File(['data'], 'receipt.png', { type: 'image/png' });
    const result = prepareFileUpload(file, { filename: 'custom.pdf', contentType: 'application/pdf' });

    expect(result.contentType).toBe('application/pdf');
    const entry = result.formData.get('image') as File;
    expect(entry.name).toBe('custom.pdf');
  });

  it('uses "image" as FormData field name', () => {
    const buffer = Buffer.from('data');
    const result = prepareFileUpload(buffer);

    expect(result.formData.has('image')).toBe(true);
    expect(result.formData.get('image')).toBeTruthy();
  });
});

describe('prepareUrlUpload', () => {
  it('returns body with image_url', () => {
    const result = prepareUrlUpload('https://example.com/doc.pdf');

    expect(result.image_url).toBe('https://example.com/doc.pdf');
    expect(result.image_content_type).toBeUndefined();
  });

  it('includes content type when provided', () => {
    const result = prepareUrlUpload('https://example.com/doc.pdf', 'application/pdf');

    expect(result.image_url).toBe('https://example.com/doc.pdf');
    expect(result.image_content_type).toBe('application/pdf');
  });

  it('omits content type when not provided', () => {
    const result = prepareUrlUpload('https://example.com/file');

    expect('image_content_type' in result).toBe(false);
  });
});

describe('prepareBase64Upload', () => {
  it('returns body with image_base64 for plain base64', () => {
    const base64 = 'SGVsbG8gV29ybGQ=';
    const result = prepareBase64Upload(base64);

    expect(result.image_base64).toBe(base64);
    expect(result.image_content_type).toBeUndefined();
  });

  it('includes content type for plain base64 when provided', () => {
    const result = prepareBase64Upload('SGVsbG8=', 'application/pdf');

    expect(result.image_base64).toBe('SGVsbG8=');
    expect(result.image_content_type).toBe('application/pdf');
  });

  it('strips data URI prefix', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
    const result = prepareBase64Upload(dataUri);

    expect(result.image_base64).toBe('iVBORw0KGgo=');
  });

  it('omits content type when data URI prefix is present', () => {
    const dataUri = 'data:image/jpeg;base64,/9j/4AAQ=';
    const result = prepareBase64Upload(dataUri, 'image/png');

    expect(result.image_base64).toBe('/9j/4AAQ=');
    expect('image_content_type' in result).toBe(false);
  });

  it('handles data URI with application content type', () => {
    const dataUri = 'data:application/pdf;base64,JVBERi0=';
    const result = prepareBase64Upload(dataUri);

    expect(result.image_base64).toBe('JVBERi0=');
    expect('image_content_type' in result).toBe(false);
  });

  it('omits content type key when not provided for plain base64', () => {
    const result = prepareBase64Upload('SGVsbG8=');

    expect('image_content_type' in result).toBe(false);
  });
});
