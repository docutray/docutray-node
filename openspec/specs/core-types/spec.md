# core-types Specification

## Purpose
TBD - created by archiving change issue-3-core-layer. Update Purpose after archive.
## Requirements
### Requirement: ClientOptions interface
The SDK SHALL export a `ClientOptions` interface with: `apiKey` (string), `baseURL` (string, optional), `timeout` (number, optional), `maxRetries` (number, optional), `fetch` (typeof fetch, optional).

#### Scenario: Minimal client options
- **WHEN** a client is created with `{ apiKey: 'dt_test_123' }`
- **THEN** it SHALL use default values for baseURL, timeout, maxRetries, and fetch

### Requirement: RequestOptions interface
The SDK SHALL export a `RequestOptions` interface with: `headers` (Record<string, string>, optional), `signal` (AbortSignal, optional), `timeout` (number, optional), `maxRetries` (number, optional), `raw` (boolean, optional).

#### Scenario: Per-request timeout override
- **WHEN** a request is made with `{ timeout: 5000 }`
- **THEN** it SHALL override the client-level timeout for that request only

### Requirement: RetryConfig interface
The SDK SHALL export a `RetryConfig` interface with: `maxRetries` (number), `initialDelay` (number), `maxDelay` (number), `exponentialBase` (number), `jitterMin` (number), `jitterMax` (number).

#### Scenario: Custom retry configuration
- **WHEN** a `RetryConfig` with `maxRetries: 5` is provided
- **THEN** the client SHALL retry up to 5 times on retryable errors

### Requirement: FileInput type
The SDK SHALL export a `FileInput` type representing file upload inputs, accepting: `Blob`, `Buffer`, `ArrayBuffer`, `ReadableStream`, or `{ content: Buffer | Blob; filename: string; contentType?: string }`.

#### Scenario: Buffer as file input
- **WHEN** a `Buffer` is provided as `FileInput`
- **THEN** it SHALL be accepted as valid file content

### Requirement: VERSION constant
The SDK SHALL export a `VERSION` constant (string) matching the version in `package.json`.

#### Scenario: Version matches package.json
- **WHEN** `VERSION` is accessed
- **THEN** it SHALL equal the `version` field from `package.json`

### Requirement: SDK constants
The SDK SHALL export constants: `DEFAULT_BASE_URL` ("https://api.docutray.com/v1"), `DEFAULT_TIMEOUT` (60000ms), `DEFAULT_MAX_RETRIES` (2), `RETRYABLE_STATUS_CODES` ([429, 500, 502, 503, 504]), retry config defaults (initialDelay 500ms, maxDelay 8000ms, exponentialBase 2, jitterMin 0.25, jitterMax 0.5), polling defaults (interval 2000ms, timeout 300000ms).

#### Scenario: Default timeout value
- **WHEN** `DEFAULT_TIMEOUT` is accessed
- **THEN** it SHALL equal 60000

### Requirement: Utility functions
The SDK SHALL export: `readEnv(name)` to read environment variables safely, `sleep(ms)` to create a delay Promise, and `maskApiKey(key)` to mask an API key for logging (showing only last 4 characters).

#### Scenario: Read environment variable
- **WHEN** `readEnv('DOCUTRAY_API_KEY')` is called with the env var set to `dt_test_123`
- **THEN** it SHALL return `'dt_test_123'`

#### Scenario: Mask API key
- **WHEN** `maskApiKey('dt_test_abcdef1234')` is called
- **THEN** it SHALL return a masked string showing only the last 4 characters (e.g., `'dt_...1234'`)

### Requirement: APIResource base class
The SDK SHALL export an `APIResource` class that stores a reference to the `APIClient` instance and serves as the base class for all resource classes.

#### Scenario: Resource stores client reference
- **WHEN** an `APIResource` is created with a client instance
- **THEN** it SHALL expose the client for making HTTP requests

