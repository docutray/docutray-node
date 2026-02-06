# step-types Specification

## Purpose
TypeScript types and helper functions for step execution: status tracking, run parameters, and type guards.
## Requirements
### Requirement: StepExecutionStatusType union
The SDK SHALL export a `StepExecutionStatusType` type as a string union: `"ENQUEUED" | "PROCESSING" | "SUCCESS" | "ERROR"`.

#### Scenario: Valid step execution status
- **WHEN** `"SUCCESS"` is assigned to a `StepExecutionStatusType` variable
- **THEN** it SHALL be accepted by the TypeScript compiler

### Requirement: StepExecutionStatus interface
The SDK SHALL export a `StepExecutionStatus` interface with snake_case properties matching the API response: `id` (string), `conversion_id` (string, optional — present in status response), `status` (StepExecutionStatusType), `step_id` (string | null), `step_name` (string | null), `request_timestamp` (string | null), `response_timestamp` (string | null), `original_filename` (string | null), `data` (Record<string, unknown> | null), `error` (string | Record<string, unknown> | null), `identification` (Record<string, unknown> | null, optional), `validation` (Record<string, unknown> | null, optional), `document_metadata` (Record<string, unknown> | null, optional).

#### Scenario: Successful step execution
- **WHEN** a step execution completes with status `"SUCCESS"`
- **THEN** `data` SHALL contain the result data, `error` SHALL be `null`

#### Scenario: Failed step execution with string error
- **WHEN** a step execution fails with a string error message
- **THEN** `error` SHALL be the string message and `data` SHALL be `null`

#### Scenario: Failed step execution with structured error
- **WHEN** a step execution fails with a structured error object
- **THEN** `error` SHALL be `Record<string, unknown>` and `data` SHALL be `null`

### Requirement: StepsRunParams interface
The SDK SHALL export a `StepsRunParams` interface with properties: `stepId` (string), `file` (FileInput, optional), `url` (string, optional), `base64` (string, optional), `contentType` (ImageContentType, optional), `filename` (string, optional), `documentMetadata` (Record<string, unknown>, optional — additional metadata to attach to the document), `wait` (boolean, optional), `webhookUrl` (string, optional).

#### Scenario: Step run with file
- **WHEN** params include `{ stepId: "step_abc", file: buffer }`
- **THEN** they SHALL be assignable to `StepsRunParams`

### Requirement: Step execution type-guard functions
The SDK SHALL export functions `isStepExecutionComplete(status: StepExecutionStatus): boolean`, `isStepExecutionSuccess(status: StepExecutionStatus): boolean`, `isStepExecutionError(status: StepExecutionStatus): boolean`.

#### Scenario: Check step complete
- **WHEN** `isStepExecutionComplete` is called with status `"SUCCESS"`
- **THEN** it SHALL return `true`

#### Scenario: Check step error
- **WHEN** `isStepExecutionError` is called with status `"ERROR"`
- **THEN** it SHALL return `true`

