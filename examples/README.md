# DocuTray SDK Examples

Usage examples for the DocuTray Node.js SDK.

## Setup

1. Copy `.env.example` to `.env` and add your API key:

   ```bash
   cp examples/.env.example examples/.env
   ```

2. Run any example:

   ```bash
   npx tsx examples/convert.ts
   ```

## Examples

| File | Description |
|------|-------------|
| `convert.ts` | Document conversion (file, URL, base64; sync and async with polling) |
| `identify.ts` | Document type identification (file, URL, base64; sync and async) |
| `steps.ts` | Running predefined processing steps (file, URL, base64; async with polling) |
| `document-types.ts` | Listing, retrieving, and validating document types |

## Notes

- Each example runs a single variant by default. Uncomment other function calls at the bottom of the file to try different input methods or async modes.
- Running examples will consume API credits.
- All examples use the `DOCUTRAY_API_KEY` environment variable for authentication.
- Steps also require `DOCUTRAY_STEP_ID` in `.env`.
