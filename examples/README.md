# DocuTray SDK Examples

Usage examples for the DocuTray Node.js SDK.

## Setup

1. Copy `.env.example` to `.env` and add your API key:

   ```bash
   cp .env.example .env
   ```

2. Install [tsx](https://github.com/privatenumber/tsx) for running TypeScript directly:

   ```bash
   npm install -g tsx
   ```

3. Run any example:

   ```bash
   npx tsx examples/convert.ts
   ```

## Examples

| File | Description |
|------|-------------|
| `convert.ts` | Document conversion (sync and async with polling) |
| `identify.ts` | Document type identification |
| `document-types.ts` | Listing, retrieving, and validating document types |
| `steps.ts` | Running predefined processing steps |
| `knowledge-bases.ts` | Managing knowledge bases, documents, and semantic search |

## Notes

- Each example contains commented-out function calls. Uncomment the ones you want to run.
- Running examples will consume API credits.
- All examples use the `DOCUTRAY_API_KEY` environment variable for authentication.
