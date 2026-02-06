## ADDED Requirements

### Requirement: Retry integration test
Integration tests SHALL verify that retry logic works end-to-end through the `DocuTray` client. Tests SHALL use MSW handlers that return transient errors then succeed.

#### Scenario: Retry succeeds after transient failure
- **WHEN** an MSW handler returns 500 on the first request and 200 on the second
- **THEN** the client SHALL retry and return the successful response

#### Scenario: Retry respects maxRetries
- **WHEN** an MSW handler returns 500 for more requests than `maxRetries` allows
- **THEN** the client SHALL throw `InternalServerError` after exhausting retries

### Requirement: Timeout and cancellation integration test
Integration tests SHALL verify timeout and AbortSignal cancellation through the `DocuTray` client.

#### Scenario: Timeout via options
- **WHEN** a request is made with a short timeout and the server delays beyond it
- **THEN** the client SHALL throw `APITimeoutError`

#### Scenario: AbortSignal cancellation
- **WHEN** a request is in progress and the AbortSignal is aborted
- **THEN** the client SHALL throw `APITimeoutError`

### Requirement: Pagination integration test
Integration tests SHALL verify pagination works end-to-end through a resource that returns `Page<T>` objects.

#### Scenario: Iterate across multiple pages
- **WHEN** MSW handlers return paginated responses (3 pages of document types)
- **THEN** `autoPagingIter()` or `for await` SHALL yield all items from all pages

#### Scenario: toArray with limit
- **WHEN** `page.toArray({ limit: N })` is called on a multi-page result
- **THEN** the result SHALL contain at most N items

#### Scenario: Early break stops fetching
- **WHEN** iteration is broken early (after collecting items from first page)
- **THEN** subsequent pages SHALL NOT be fetched

### Requirement: Polling integration test
Integration tests SHALL verify async polling works end-to-end through the `DocuTray` client.

#### Scenario: Polling lifecycle success
- **WHEN** `runAsync().wait()` is called and MSW returns ENQUEUED → PROCESSING → SUCCESS
- **THEN** the final result SHALL have status SUCCESS

#### Scenario: Polling lifecycle failure
- **WHEN** polling encounters a FAILED status
- **THEN** `wait()` SHALL throw `DocuTrayError`

#### Scenario: Polling timeout
- **WHEN** the server never transitions to a terminal state within the timeout
- **THEN** `wait()` SHALL throw `APITimeoutError`

#### Scenario: onStatus callback
- **WHEN** `wait({ onStatus })` is called with a callback
- **THEN** the callback SHALL be invoked with each polled status
