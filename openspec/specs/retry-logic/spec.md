# retry-logic Specification

## Purpose
TBD - created by archiving change issue-3-core-layer. Update Purpose after archive.
## Requirements
### Requirement: Exponential backoff delay calculation
The SDK SHALL export a `calculateRetryDelay()` function that computes retry delay using exponential backoff with jitter. The formula SHALL be: `min(initialDelay * base^attempt + jitter, maxDelay)` where initialDelay=500ms, base=2, maxDelay=8000ms.

#### Scenario: First retry delay
- **WHEN** `calculateRetryDelay` is called for attempt 0
- **THEN** the delay SHALL be approximately 500ms (plus jitter)

#### Scenario: Second retry delay
- **WHEN** `calculateRetryDelay` is called for attempt 1
- **THEN** the delay SHALL be approximately 1000ms (plus jitter)

#### Scenario: Delay capped at maximum
- **WHEN** `calculateRetryDelay` is called for attempt 10
- **THEN** the delay SHALL NOT exceed 8000ms

### Requirement: Jitter
`calculateRetryDelay()` SHALL add random jitter between 25% and 50% of the base delay to prevent thundering herd.

#### Scenario: Jitter bounds
- **WHEN** the base delay before jitter is D
- **THEN** the final delay SHALL be between D + 0.25*D and D + 0.5*D (i.e., between 1.25*D and 1.5*D), capped at maxDelay

### Requirement: Retry-After header respect
`calculateRetryDelay()` SHALL accept an optional `retryAfter` parameter (seconds). When provided, the returned delay SHALL be at least `retryAfter * 1000` milliseconds.

#### Scenario: Retry-After header present
- **WHEN** the server returns `Retry-After: 5` and the calculated backoff is 1000ms
- **THEN** the delay SHALL be at least 5000ms

### Requirement: Retry decision
The SDK SHALL export a `shouldRetry()` function that returns `true` when: the attempt count is below `maxRetries`, AND the status code is in `RETRYABLE_STATUS_CODES` (429, 500, 502, 503, 504) OR the error is a connection error.

#### Scenario: Retryable status code
- **WHEN** status code is 429 and attempts < maxRetries
- **THEN** `shouldRetry()` SHALL return `true`

#### Scenario: Non-retryable status code
- **WHEN** status code is 400
- **THEN** `shouldRetry()` SHALL return `false`

#### Scenario: Max retries exceeded
- **WHEN** attempt count equals maxRetries
- **THEN** `shouldRetry()` SHALL return `false`

#### Scenario: Connection error
- **WHEN** a connection error occurs and attempts < maxRetries
- **THEN** `shouldRetry()` SHALL return `true`

