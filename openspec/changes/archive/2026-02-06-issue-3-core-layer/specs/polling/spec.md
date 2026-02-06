## ADDED Requirements

### Requirement: Wait for completion function
The SDK SHALL export a `waitForCompletion<T>()` function that polls a resource's status until it reaches a terminal state. It SHALL accept: a `getStatus` callback, `pollInterval` (default 2s), `timeout` (default 300s), and an optional `onStatus` callback.

#### Scenario: Successful completion
- **WHEN** `waitForCompletion()` is called and the resource transitions to a completed state
- **THEN** it SHALL return the final resource state

### Requirement: Polling interval
`waitForCompletion()` SHALL wait `pollInterval` milliseconds between each status check. The default interval SHALL be 2000ms.

#### Scenario: Custom polling interval
- **WHEN** `waitForCompletion()` is called with `{ pollInterval: 5000 }`
- **THEN** it SHALL wait 5 seconds between each status check

### Requirement: Polling timeout
`waitForCompletion()` SHALL throw an `APITimeoutError` if the resource does not reach a terminal state within the configured `timeout`. The default timeout SHALL be 300 seconds.

#### Scenario: Polling exceeds timeout
- **WHEN** the resource does not complete within the timeout period
- **THEN** a `APITimeoutError` SHALL be thrown

### Requirement: Status callback
`waitForCompletion()` SHALL invoke the optional `onStatus` callback with the current status on each poll iteration.

#### Scenario: Status callback invoked
- **WHEN** `waitForCompletion()` polls 3 times before completion
- **THEN** the `onStatus` callback SHALL be invoked 3 times with the intermediate statuses

### Requirement: Failed resource handling
`waitForCompletion()` SHALL throw a `DocuTrayError` if the resource transitions to a failed state.

#### Scenario: Resource fails
- **WHEN** the polled resource reports a failed status
- **THEN** a `DocuTrayError` SHALL be thrown with the failure details
