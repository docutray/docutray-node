# shared-types Specification

## Purpose
Common TypeScript types and interfaces (pagination, rate limiting, quota, image content types, error details) shared across the SDK for consistent API response typing.
## Requirements
### Requirement: Pagination interface
The SDK SHALL export a `Pagination` interface with properties: `total` (number), `page` (number), `limit` (number).

#### Scenario: Pagination from API response
- **WHEN** an API response includes `{ "total": 50, "page": 1, "limit": 10 }`
- **THEN** it SHALL be assignable to the `Pagination` type with all three numeric properties

### Requirement: PaginatedResponse generic interface
The SDK SHALL export a `PaginatedResponse<T>` generic interface with properties: `data` (T[]), `pagination` (Pagination).

#### Scenario: Typed paginated list
- **WHEN** a paginated response of document types is received
- **THEN** `PaginatedResponse<DocumentType>` SHALL type `data` as `DocumentType[]` and `pagination` as `Pagination`

### Requirement: ImageContentType union type
The SDK SHALL export an `ImageContentType` type as a string union of accepted image MIME types: `"image/png"`, `"image/jpeg"`, `"image/tiff"`, `"image/webp"`, `"application/pdf"`.

#### Scenario: Valid content type
- **WHEN** `"image/png"` is assigned to an `ImageContentType` variable
- **THEN** it SHALL be accepted by the TypeScript compiler

#### Scenario: Invalid content type
- **WHEN** `"text/plain"` is assigned to an `ImageContentType` variable
- **THEN** it SHALL produce a TypeScript compilation error

### Requirement: RateLimitInfo interface
The SDK SHALL export a `RateLimitInfo` interface with properties: `limit` (number), `remaining` (number), `reset` (number, epoch seconds).

#### Scenario: Rate limit header data
- **WHEN** rate limit headers are parsed from an API response
- **THEN** the result SHALL be assignable to `RateLimitInfo`

### Requirement: QuotaExceededInfo interface
The SDK SHALL export a `QuotaExceededInfo` interface with properties: `limit` (number), `used` (number), `resetDate` (string, ISO 8601 timestamp).

#### Scenario: Quota exceeded response
- **WHEN** a 429 response includes quota details
- **THEN** the parsed body SHALL be assignable to `QuotaExceededInfo`

### Requirement: ErrorDetail interface
The SDK SHALL export an `ErrorDetail` interface with properties: `message` (string), `errors` (string[] | null).

#### Scenario: Error with validation details
- **WHEN** an API error response includes `{ "message": "Validation failed", "errors": ["field required"] }`
- **THEN** it SHALL be assignable to `ErrorDetail`

#### Scenario: Error without sub-errors
- **WHEN** an API error response includes `{ "message": "Not found", "errors": null }`
- **THEN** it SHALL be assignable to `ErrorDetail` with `errors` as `null`

