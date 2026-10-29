/** Injected at build time from `package.json` (see `tsup.config.ts`). */
declare const __SDK_VERSION__: string;

/** The SDK version, sent in the `User-Agent` header. */
export const VERSION: string = __SDK_VERSION__;
