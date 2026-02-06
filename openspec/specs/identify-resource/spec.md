## ADDED Requirements

### Requirement: Identify resource class
The SDK SHALL export an `Identify` class extending `APIResource` in `src/resources/identify.ts`. It SHALL provide methods `run()`, `runAsync()`, and `getStatus()`.

#### Scenario: Importing Identify
- **WHEN** a consumer imports from the SDK
- **THEN** the `Identify` class SHALL be available as a named export

### Requirement: Identify.run() with file upload
`Identify.run()` SHALL accept `IdentifyParams` and `RequestOptions`, and POST to `/api/identify`. It SHALL route file uploads through 3 paths: multipart (`params.file`), URL JSON (`params.url`), or base64 JSON (`params.base64`). It SHALL throw `DocuTrayError` if none is provided.

#### Scenario: File upload via multipart
- **WHEN** `run()` is called with `params.file`
- **THEN** it SHALL create FormData using `prepareFileUpload()`, append other params as form fields, and POST as multipart

#### Scenario: File upload via URL
- **WHEN** `run()` is called with `params.url`
- **THEN** it SHALL build a JSON body using `prepareUrlUpload()` merged with other params, and POST as JSON

#### Scenario: File upload via base64
- **WHEN** `run()` is called with `params.base64`
- **THEN** it SHALL build a JSON body using `prepareBase64Upload()` merged with other params, and POST as JSON

#### Scenario: No file source provided
- **WHEN** `run()` is called without `file`, `url`, or `base64`
- **THEN** it SHALL throw a `DocuTrayError`

### Requirement: Identify.runAsync() with polling
`Identify.runAsync()` SHALL POST to `/api/identify-async` and return an `IdentificationStatus` enhanced with `wait()` that polls via `getStatus()`.

#### Scenario: Async identification with wait
- **WHEN** `runAsync()` is called and `wait()` is called on the result
- **THEN** it SHALL poll `getStatus()` until `isIdentificationComplete()` returns true

### Requirement: Identify.getStatus()
`Identify.getStatus()` SHALL accept an `identificationId` string and GET `/api/identify-async/status/{identificationId}`. The polling in `runAsync().wait()` SHALL use `status.id` from the API response to call `getStatus()`.

#### Scenario: Getting identification status
- **WHEN** `getStatus('id-456')` is called
- **THEN** it SHALL GET `/api/identify-async/status/id-456` and return the status object

### Requirement: Identify.withRawResponse
`Identify` SHALL expose a `withRawResponse` getter returning an `IdentifyWithRawResponse` instance.

#### Scenario: Raw response from run
- **WHEN** `identify.withRawResponse.run(params)` is called
- **THEN** it SHALL return a `RawResponse<IdentificationStatus>` with `statusCode` and `headers`
