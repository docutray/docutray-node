# step-types Specification

## Purpose
TBD - created by archiving change issue-5-type-definitions. Update Purpose after archive.
## Requirements
### Requirement: StepExecutionStatusType union
The SDK SHALL export a `StepExecutionStatusType` type as a string union: `"ENQUEUED" | "PROCESSING" | "SUCCESS" | "ERROR"`.

#### Scenario: Valid step execution status
- **WHEN** `"SUCCESS"` is assigned to a `StepExecutionStatusType` variable
- **THEN** it SHALL be accepted by the TypeScript compiler

### Requirement: StepExecutionStatus interface
The SDK SHALL export a `StepExecutionStatus` interface with properties: `executionId` (string), `status` (StepExecutionStatusType), `requestTimestamp` (string | null), `responseTimestamp` (string | null), `stepId` (string | null), `originalFilename` (string | null), `data` (Record<string, unknown> | null), `error` (string | Record<string, unknown> | null).

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
The SDK SHALL export a `StepsRunParams` interface with properties: `stepId` (string), `file` (FileInput, optional), `url` (string, optional), `base64` (string, optional), `contentType` (ImageContentType, optional), `filename` (string, optional), `wait` (boolean, optional), `webhookUrl` (string, optional).

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

