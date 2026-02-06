# http-client Specification

## Purpose
TBD - created by archiving change issue-3-core-layer. Update Purpose after archive.
## Requirements
### Requirement: APIClient class
The SDK SHALL export an `APIClient` class that accepts `ClientOptions` (apiKey, baseURL, timeout, maxRetries, fetch) and performs HTTP requests against the DocuTray API.

#### Scenario: Creating client with API key
- **WHEN** an `APIClient` is created with `{ apiKey: 'dt_test_123' }`
- **THEN** it SHALL use the API key for Bearer token authentication in all requests

### Requirement: Bearer token authentication
`APIClient` SHALL include an `Authorization: Bearer <apiKey>` header on every request.

#### Scenario: Request includes auth header
- **WHEN** a request is made through the client
- **THEN** the request SHALL include the header `Authorization: Bearer <apiKey>`

### Requirement: User-Agent header
`APIClient` SHALL include a `User-Agent` header in the format `docutray-node/<VERSION>` on every request.

#### Scenario: Request includes user-agent
- **WHEN** a request is made through the client
- **THEN** the request SHALL include a `User-Agent` header matching `docutray-node/<VERSION>`

### Requirement: Request timeout via AbortController
`APIClient` SHALL abort requests that exceed the configured timeout using `AbortController`. The default timeout SHALL be 60 seconds.

#### Scenario: Request times out
- **WHEN** a request takes longer than the configured timeout
- **THEN** the client SHALL abort the request and throw an `APITimeoutError`

### Requirement: Retry on failure
`APIClient` SHALL retry failed requests according to the retry configuration (maxRetries, retryable status codes, connection errors). The default maxRetries SHALL be 2.

#### Scenario: Retry on 500
- **WHEN** a request receives a 500 response and retries remain
- **THEN** the client SHALL retry the request after the calculated delay

#### Scenario: No retry on 400
- **WHEN** a request receives a 400 response
- **THEN** the client SHALL NOT retry and SHALL throw a `BadRequestError`

### Requirement: Injectable fetch
`APIClient` SHALL accept a custom `fetch` function via `ClientOptions` for testing and edge runtime support. If not provided, it SHALL use `globalThis.fetch`.

#### Scenario: Custom fetch function
- **WHEN** a custom fetch function is provided in options
- **THEN** the client SHALL use that function instead of `globalThis.fetch`

### Requirement: Request methods
`APIClient` SHALL provide methods for HTTP verbs: `get()`, `post()`, `put()`, `patch()`, `delete()`. Each SHALL accept a path, optional body, and `RequestOptions`.

#### Scenario: GET request
- **WHEN** `client.get('/documents')` is called
- **THEN** a GET request SHALL be made to `{baseURL}/documents`

#### Scenario: POST with JSON body
- **WHEN** `client.post('/documents', { body: { name: 'test' } })` is called
- **THEN** a POST request SHALL be made with JSON-encoded body and `Content-Type: application/json`

### Requirement: Default base URL
`APIClient` SHALL use `https://api.docutray.com/v1` as the default base URL.

#### Scenario: Default URL
- **WHEN** no baseURL is provided
- **THEN** requests SHALL be sent to `https://api.docutray.com/v1`

### Requirement: Raw response access
`APIClient` SHALL support a `{ raw: true }` request option that returns a `RawResponse<T>` instead of the parsed body.

#### Scenario: Raw response requested
- **WHEN** a request is made with `{ raw: true }`
- **THEN** the client SHALL return a `RawResponse<T>` with `statusCode`, `headers`, and `parse()` method

