## ADDED Requirements

### Requirement: MSW mock server setup
The test infrastructure SHALL include a shared MSW server in `tests/helpers/mock-server.ts` using `setupServer()` from `msw/node`. It SHALL export the `server` instance and `http` from `msw` for handler creation.

#### Scenario: Server is available for tests
- **WHEN** a test file imports from `tests/helpers/mock-server`
- **THEN** it SHALL receive a configured MSW `server` instance

### Requirement: Test lifecycle hooks
`tests/helpers/setup.ts` SHALL configure MSW lifecycle: `beforeAll` starts the server, `afterEach` resets handlers, `afterAll` stops the server.

#### Scenario: Clean handler state between tests
- **WHEN** a test adds a handler with `server.use()` and the test completes
- **THEN** `afterEach` SHALL reset to default handlers

### Requirement: Shared test fixtures
`tests/helpers/fixtures.ts` SHALL export reusable test data: mock API responses for each resource (conversion statuses, identification results, document types, knowledge bases, etc.) and a `createTestClient()` helper that returns an `APIClient` pointed at the MSW intercepted base URL.

#### Scenario: Creating a test client
- **WHEN** `createTestClient()` is called
- **THEN** it SHALL return an `APIClient` with `apiKey: 'test-key'` and `baseURL` matching the MSW server

#### Scenario: Using mock response fixtures
- **WHEN** a test needs a mock `ConversionStatus` response
- **THEN** it SHALL be available as a named export from fixtures
