## ADDED Requirements

### Requirement: Convert resource class
The SDK SHALL export a `Convert` class extending `APIResource` in `src/resources/convert.ts`. It SHALL provide methods `run()`, `runAsync()`, and `getStatus()`.

#### Scenario: Importing Convert
- **WHEN** a consumer imports from the SDK
- **THEN** the `Convert` class SHALL be available as a named export

### Requirement: Convert.run() with file upload
`Convert.run()` SHALL accept `ConvertParams` and `RequestOptions`, and POST to `/api/convert`. It SHALL route file uploads through 3 paths: multipart (`params.file`), URL JSON (`params.url`), or base64 JSON (`params.base64`). It SHALL throw `DocuTrayError` if none of the three is provided.

#### Scenario: File upload via multipart
- **WHEN** `run()` is called with `params.file` set to a Buffer
- **THEN** it SHALL create FormData using `prepareFileUpload()`, append `documentTypeCode` and other params as form fields, and POST as multipart

#### Scenario: File upload via URL
- **WHEN** `run()` is called with `params.url` set to a URL string
- **THEN** it SHALL build a JSON body using `prepareUrlUpload()` merged with other params, and POST as JSON

#### Scenario: File upload via base64
- **WHEN** `run()` is called with `params.base64` set to a base64 string
- **THEN** it SHALL build a JSON body using `prepareBase64Upload()` merged with other params, and POST as JSON

#### Scenario: No file source provided
- **WHEN** `run()` is called without `file`, `url`, or `base64`
- **THEN** it SHALL throw a `DocuTrayError` with a descriptive message

### Requirement: Convert.runAsync() with polling
`Convert.runAsync()` SHALL POST to `/api/convert-async` using the same file routing as `run()`. The returned `ConversionStatus` object SHALL be enhanced with a `wait()` method that calls `waitForCompletion()` using `getStatus()` as the poller and `isConversionComplete`/`isConversionError` as status checks.

#### Scenario: Async conversion with wait
- **WHEN** `runAsync()` is called and `wait()` is called on the result
- **THEN** it SHALL poll `getStatus()` until `isConversionComplete()` returns true

### Requirement: Convert.getStatus()
`Convert.getStatus()` SHALL accept a `conversionId` string and GET `/api/convert-async/status/{conversionId}`, returning a `ConversionStatus`.

#### Scenario: Getting conversion status
- **WHEN** `getStatus('conv-123')` is called
- **THEN** it SHALL GET `/api/convert-async/status/conv-123` and return the status object

### Requirement: Convert.withRawResponse
`Convert` SHALL expose a `withRawResponse` getter returning a `ConvertWithRawResponse` instance. Each method on the wrapper SHALL return `RawResponse<T>` instead of `T`.

#### Scenario: Raw response from run
- **WHEN** `convert.withRawResponse.run(params)` is called
- **THEN** it SHALL return a `RawResponse<ConversionStatus>` with `statusCode` and `headers`
