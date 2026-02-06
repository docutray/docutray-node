## 1. Pagination Adaptation

- [ ] 1.1 Adapt `Page<T>` in `src/core/pagination.ts` from cursor-based to offset-based pagination (`data`/`pagination: {total, page, limit}`)
- [ ] 1.2 Update `tests/core/pagination.test.ts` for the new pagination format

## 2. Test Infrastructure

- [ ] 2.1 Create `tests/helpers/mock-server.ts` with MSW `setupServer()` setup
- [ ] 2.2 Create `tests/helpers/setup.ts` with lifecycle hooks (beforeAll/afterEach/afterAll)
- [ ] 2.3 Create `tests/helpers/fixtures.ts` with `createTestClient()` and mock response data for all resources

## 3. Convert Resource

- [ ] 3.1 Create `src/resources/convert.ts` with `Convert` class: `run()`, `runAsync()`, `getStatus()`, `withRawResponse`
- [ ] 3.2 Write `tests/resources/convert.test.ts` covering file routing, async polling, raw response, and error cases

## 4. Identify Resource

- [ ] 4.1 Create `src/resources/identify.ts` with `Identify` class: `run()`, `runAsync()`, `getStatus()`, `withRawResponse`
- [ ] 4.2 Write `tests/resources/identify.test.ts` covering file routing, async polling, raw response, and error cases

## 5. DocumentTypes Resource

- [ ] 5.1 Create `src/resources/document-types.ts` with `DocumentTypes` class: `list()`, `get()`, `validate()`, `withRawResponse`
- [ ] 5.2 Write `tests/resources/document-types.test.ts` covering pagination, get, validate, and raw response

## 6. Steps Resource

- [ ] 6.1 Create `src/resources/steps.ts` with `Steps` class: `runAsync()`, `getStatus()`, `withRawResponse`
- [ ] 6.2 Write `tests/resources/steps.test.ts` covering file routing, async polling, raw response, and error cases

## 7. KnowledgeBases Resource

- [ ] 7.1 Create `src/resources/knowledge-bases.ts` with `KnowledgeBases` class: CRUD + `search()`, `sync()`, `documents()`, `withRawResponse`
- [ ] 7.2 Create `KnowledgeBaseDocuments` sub-resource class with CRUD + `withRawResponse` in the same file
- [ ] 7.3 Write `tests/resources/knowledge-bases.test.ts` covering all methods, sub-resource, pagination, and raw response

## 8. Exports and Integration

- [ ] 8.1 Create `src/resources/index.ts` re-exporting all resource classes
- [ ] 8.2 Update `src/index.ts` to export all resources
- [ ] 8.3 Verify `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` all pass
