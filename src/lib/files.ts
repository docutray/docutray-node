import type { FileInput, FileWithMetadata } from '../core/types.js';

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

const DEFAULT_CONTENT_TYPE = 'application/pdf';
const DEFAULT_FILENAME = 'document';
const UPLOAD_FIELD_NAME = 'image';

export interface FileUpload {
  formData: FormData;
  contentType: string;
}

export interface UrlUploadBody {
  image_url: string;
  image_content_type?: string;
}

export interface Base64UploadBody {
  image_base64: string;
  image_content_type?: string;
}

export function detectContentType(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) {
    return 'application/octet-stream';
  }
  const ext = filename.slice(dotIndex).toLowerCase();
  return EXTENSION_TO_CONTENT_TYPE[ext] ?? 'application/octet-stream';
}

function isFileWithMetadata(file: FileInput): file is FileWithMetadata {
  return (
    typeof file === 'object' &&
    file !== null &&
    'content' in file &&
    'filename' in file
  );
}

export function prepareFileUpload(
  file: FileInput,
  options?: { filename?: string; contentType?: string },
): FileUpload {
  let blob: Blob;
  let filename: string;
  let contentType: string;

  if (isFileWithMetadata(file)) {
    blob = Buffer.isBuffer(file.content)
      ? new Blob([new Uint8Array(file.content)])
      : file.content;
    filename = file.filename;
    contentType = file.contentType ?? detectContentType(file.filename);
  } else if (Buffer.isBuffer(file)) {
    filename = options?.filename ?? DEFAULT_FILENAME;
    contentType = options?.contentType
      ?? (options?.filename ? detectContentType(options.filename) : DEFAULT_CONTENT_TYPE);
    blob = new Blob([new Uint8Array(file)]);
  } else if (file instanceof ArrayBuffer) {
    filename = options?.filename ?? DEFAULT_FILENAME;
    contentType = options?.contentType
      ?? (options?.filename ? detectContentType(options.filename) : DEFAULT_CONTENT_TYPE);
    blob = new Blob([file]);
  } else {
    // Blob
    filename = options?.filename ?? DEFAULT_FILENAME;
    contentType = options?.contentType
      ?? (options?.filename ? detectContentType(options.filename) : DEFAULT_CONTENT_TYPE);
    blob = file;
  }

  const formData = new FormData();
  formData.append(UPLOAD_FIELD_NAME, blob, filename);

  return { formData, contentType };
}

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

const DATA_URI_REGEX = /^data:[^;]+;base64,/;

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
