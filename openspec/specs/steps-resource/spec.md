## ADDED Requirements

### Requirement: Steps resource class
The SDK SHALL export a `Steps` class extending `APIResource` in `src/resources/steps.ts`. It SHALL provide methods `runAsync()` and `getStatus()`.

#### Scenario: Importing Steps
- **WHEN** a consumer imports from the SDK
- **THEN** the `Steps` class SHALL be available as a named export

### Requirement: Steps.runAsync() with file upload
`Steps.runAsync()` SHALL accept `StepsRunParams` and `RequestOptions`, and POST to `/api/steps-async/{stepId}`. It SHALL route file uploads through 3 paths: multipart, URL JSON, or base64 JSON. The returned `StepExecutionStatus` SHALL be enhanced with a `wait()` method.

#### Scenario: Async step execution via file
- **WHEN** `runAsync({ stepId: 'step-1', file: buffer })` is called
- **THEN** it SHALL POST multipart to `/api/steps-async/step-1`

#### Scenario: Async step execution via URL
- **WHEN** `runAsync({ stepId: 'step-1', url: 'https://...' })` is called
- **THEN** it SHALL POST JSON to `/api/steps-async/step-1`

#### Scenario: No file source provided
- **WHEN** `runAsync()` is called without `file`, `url`, or `base64`
- **THEN** it SHALL throw a `DocuTrayError`

#### Scenario: Polling with wait
- **WHEN** `wait()` is called on the returned status
- **THEN** it SHALL poll `getStatus()` until `isStepExecutionComplete()` returns true

### Requirement: Steps.getStatus()
`Steps.getStatus()` SHALL accept an `executionId` string and GET `/api/steps-async/status/{executionId}`.

#### Scenario: Getting step execution status
- **WHEN** `getStatus('exec-abc')` is called
- **THEN** it SHALL GET `/api/steps-async/status/exec-abc` and return the status object

### Requirement: Steps.withRawResponse
`Steps` SHALL expose a `withRawResponse` getter returning a `StepsWithRawResponse` instance.

#### Scenario: Raw response from runAsync
- **WHEN** `steps.withRawResponse.runAsync(params)` is called
- **THEN** it SHALL return a `RawResponse<StepExecutionStatus>`
