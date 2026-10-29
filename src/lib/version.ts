/** Injected at build time from `package.json` (see `tsup.config.ts`). */
declare const __SDK_VERSION__: string | undefined;

/**
 * The SDK version, sent in the `User-Agent` header. Falls back to `0.0.0-dev`
 * when the source runs without the build-time constant (e.g. with tsx).
 */
export const VERSION: string = typeof __SDK_VERSION__ === 'string' ? __SDK_VERSION__ : '0.0.0-dev';
