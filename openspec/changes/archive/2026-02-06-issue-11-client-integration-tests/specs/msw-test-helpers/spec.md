## MODIFIED Requirements

### Requirement: Shared test fixtures
`tests/helpers/fixtures.ts` SHALL export reusable test data: mock API responses for each resource (conversion statuses, identification results, document types, knowledge bases, etc.), a `createTestClient()` helper that returns an `APIClient` pointed at the MSW intercepted base URL, and a `createDocuTrayClient()` helper that returns a `DocuTray` client instance pointed at the MSW intercepted base URL.

#### Scenario: Creating a test client
- **WHEN** `createTestClient()` is called
- **THEN** it SHALL return an `APIClient` with `apiKey: 'test-key'` and `baseURL` matching the MSW server

#### Scenario: Creating a DocuTray test client
- **WHEN** `createDocuTrayClient()` is called
- **THEN** it SHALL return a `DocuTray` instance with `apiKey: 'test-key'` and `baseURL` matching the MSW server

#### Scenario: Using mock response fixtures
- **WHEN** a test needs a mock `ConversionStatus` response
- **THEN** it SHALL be available as a named export from fixtures
