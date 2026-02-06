import type { FileInput, FileWithMetadata } from '../core/types.js';

/** @internal */
const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
};

/** @internal */
const DEFAULT_CONTENT_TYPE = 'application/pdf';
/** @internal */
const DEFAULT_FILENAME = 'document';
/** @internal */
const UPLOAD_FIELD_NAME = 'image';

/**
 * Result of preparing a file for multipart upload.
 */
export interface FileUpload {
  /** The `FormData` ready to send as a request body. */
  formData: FormData;
  /** The detected or provided MIME type. */
  contentType: string;
}

/**
 * JSON body shape for URL-based document uploads.
 */
export interface UrlUploadBody {
  /** The URL pointing to the document. */
  image_url: string;
  /** Optional MIME type hint. */
  image_content_type?: string;
}

/**
 * JSON body shape for base64-encoded document uploads.
 */
export interface Base64UploadBody {
  /** The raw base64-encoded document content (without data-URI prefix). */
  image_base64: string;
  /** Optional MIME type hint. */
  image_content_type?: string;
}

/**
 * Detects the MIME content type from a filename extension.
 *
 * @param filename - The filename to inspect.
 * @returns The detected MIME type, or `application/octet-stream` if unknown.
 */
export function detectContentType(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) {
    return 'application/octet-stream';
  }
  const ext = filename.slice(dotIndex).toLowerCase();
  return EXTENSION_TO_CONTENT_TYPE[ext] ?? 'application/octet-stream';
}

/** @internal */
function isFileWithMetadata(file: FileInput): file is FileWithMetadata {
  return (
    typeof file === 'object' &&
    file !== null &&
    'content' in file &&
    'filename' in file
  );
}

/**
 * Prepares a {@link FileInput} for multipart form upload.
 *
 * @param file - The file to upload (Blob, Buffer, ArrayBuffer, or FileWithMetadata).
 * @param options - Optional filename and content type overrides.
 * @returns A {@link FileUpload} with the `FormData` and detected content type.
 */
export function prepareFileUpload(
  file: FileInput,
  options?: { filename?: string; contentType?: string },
): FileUpload {
  let blob: Blob;
  let filename: string;
  let contentType: string;

  if (isFileWithMetadata(file)) {
    filename = file.filename;
    contentType = file.contentType ?? detectContentType(file.filename);
    blob = Buffer.isBuffer(file.content)
      ? new Blob([new Uint8Array(file.content)], { type: contentType })
      : new Blob([file.content], { type: contentType });
  } else if (Buffer.isBuffer(file)) {
    filename = options?.filename ?? DEFAULT_FILENAME;
    contentType = options?.contentType
      ?? (options?.filename ? detectContentType(options.filename) : DEFAULT_CONTENT_TYPE);
    blob = new Blob([new Uint8Array(file)], { type: contentType });
  } else if (file instanceof ArrayBuffer) {
    filename = options?.filename ?? DEFAULT_FILENAME;
    contentType = options?.contentType
      ?? (options?.filename ? detectContentType(options.filename) : DEFAULT_CONTENT_TYPE);
    blob = new Blob([file], { type: contentType });
  } else {
    // Blob or File
    const fileObj = file as { name?: unknown; type?: unknown };
    const inferredName = typeof fileObj.name === 'string' && fileObj.name ? fileObj.name : undefined;
    const inferredType = typeof fileObj.type === 'string' && fileObj.type ? fileObj.type : undefined;

    filename = options?.filename ?? inferredName ?? DEFAULT_FILENAME;
    contentType = options?.contentType
      ?? (options?.filename
        ? detectContentType(options.filename)
        : inferredType ?? (inferredName ? detectContentType(inferredName) : DEFAULT_CONTENT_TYPE));
    blob = new Blob([file], { type: contentType });
  }

  const formData = new FormData();
  formData.append(UPLOAD_FIELD_NAME, blob, filename);

  return { formData, contentType };
}

/**
 * Prepares a URL-based upload body.
 *
 * @param url - The document URL.
 * @param contentType - Optional MIME type hint.
 * @returns A {@link UrlUploadBody} ready for JSON serialization.
 */
export function prepareUrlUpload(
  url: string,
  contentType?: string,
): UrlUploadBody {
  const body: UrlUploadBody = { image_url: url };
  if (contentType) {
    body.image_content_type = contentType;
  }
  return body;
}

/** @internal */
const DATA_URI_REGEX = /^data:[^;]+;base64,/;

/**
 * Prepares a base64-encoded upload body, stripping data-URI prefixes if present.
 *
 * @param base64 - The base64 string, optionally with a `data:...;base64,` prefix.
 * @param contentType - Optional MIME type hint (ignored when a data-URI prefix is present).
 * @returns A {@link Base64UploadBody} ready for JSON serialization.
 */
export function prepareBase64Upload(
  base64: string,
  contentType?: string,
): Base64UploadBody {
  const hasDataUri = DATA_URI_REGEX.test(base64);

  const body: Base64UploadBody = {
    image_base64: hasDataUri ? base64.replace(DATA_URI_REGEX, '') : base64,
  };

  if (!hasDataUri && contentType) {
    body.image_content_type = contentType;
  }

  return body;
}
