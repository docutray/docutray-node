# error-hierarchy Specification

## Purpose
TBD - created by archiving change issue-3-core-layer. Update Purpose after archive.
## Requirements
### Requirement: Base error class
The SDK SHALL export a `DocuTrayError` class that extends `Error` and serves as the base for all SDK errors. It SHALL include a `message` property.

#### Scenario: Catching any SDK error
- **WHEN** any SDK error is thrown
- **THEN** it SHALL be an instance of `DocuTrayError` and `Error`

### Requirement: API connection error
The SDK SHALL export an `APIConnectionError` class extending `DocuTrayError` for network-level failures (DNS, TCP, TLS). It SHALL include a `cause` property with the original error.

#### Scenario: Network failure
- **WHEN** a fetch call fails with a network error (e.g., DNS resolution failure)
- **THEN** an `APIConnectionError` SHALL be thrown with the original error as `cause`

### Requirement: API timeout error
The SDK SHALL export an `APITimeoutError` class extending `APIConnectionError` for request timeouts.

#### Scenario: Request exceeds timeout
- **WHEN** a request exceeds the configured timeout duration
- **THEN** an `APITimeoutError` SHALL be thrown

### Requirement: API error with status code
The SDK SHALL export an `APIError` class extending `DocuTrayError` with properties: `statusCode` (number), `requestId` (string | undefined), `body` (unknown), `headers` (Headers).

#### Scenario: Server returns error response
- **WHEN** the API returns a non-2xx response
- **THEN** an `APIError` (or subclass) SHALL be thrown with the response status code, body, and headers

### Requirement: Status-specific error classes
The SDK SHALL export error classes for specific HTTP status codes:
- `BadRequestError` (400)
- `AuthenticationError` (401)
- `PermissionDeniedError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `UnprocessableEntityError` (422)
- `RateLimitError` (429)
- `InternalServerError` (500+)

#### Scenario: 401 response
- **WHEN** the API returns status 401
- **THEN** an `AuthenticationError` SHALL be thrown that is an instance of both `AuthenticationError` and `APIError`

#### Scenario: 429 response
- **WHEN** the API returns status 429
- **THEN** a `RateLimitError` SHALL be thrown

#### Scenario: 503 response
- **WHEN** the API returns status 503
- **THEN** an `InternalServerError` SHALL be thrown

### Requirement: Rate limit error properties
`RateLimitError` SHALL expose additional properties extracted from response headers or body: `retryAfter` (number | undefined), `limitType` (string | undefined), `limit` (number | undefined), `remaining` (number | undefined), `resetTime` (Date | undefined).

#### Scenario: Rate limit with retry-after header
- **WHEN** a 429 response includes a `retry-after` header with value `30`
- **THEN** the `RateLimitError.retryAfter` property SHALL be `30`

### Requirement: Error factory method
`APIError` SHALL have a static `generate(statusCode, body, message, headers)` method that returns the appropriate error subclass based on the status code. Unknown status codes SHALL return a generic `APIError`.

#### Scenario: Factory creates correct error type
- **WHEN** `APIError.generate(404, {}, 'Not found', headers)` is called
- **THEN** it SHALL return a `NotFoundError` instance

#### Scenario: Unknown status code
- **WHEN** `APIError.generate(418, {}, 'Teapot', headers)` is called
- **THEN** it SHALL return an `APIError` instance (not a subclass)

