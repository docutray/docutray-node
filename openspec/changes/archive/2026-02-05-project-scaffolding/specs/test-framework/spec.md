## ADDED Requirements

### Requirement: Vitest test runner configuration
The project SHALL have a `vitest.config.ts` that configures vitest with the `node` environment and v8 coverage provider.

#### Scenario: Test command exits cleanly with no tests
- **WHEN** `npm run test` is executed with no test files present
- **THEN** the command SHALL exit with code 0 without errors

#### Scenario: Test watch mode works
- **WHEN** `npm run test:watch` is executed
- **THEN** vitest SHALL start in watch mode monitoring for file changes

### Requirement: Coverage thresholds at 80%
The vitest configuration SHALL enforce minimum coverage thresholds of 80% for lines, branches, functions, and statements using the v8 coverage provider.

#### Scenario: Coverage report is generated
- **WHEN** `npm run test:coverage` is executed
- **THEN** a coverage report SHALL be generated using the v8 provider

#### Scenario: Coverage below threshold fails
- **WHEN** test coverage for any metric (lines, branches, functions, statements) falls below 80%
- **THEN** `npm run test:coverage` SHALL exit with a non-zero code

### Requirement: MSW available for HTTP mocking
The `msw` package SHALL be installed as a devDependency to support HTTP-level mocking in future test phases.

#### Scenario: MSW is importable
- **WHEN** a test file imports from `msw` or `msw/node`
- **THEN** the import SHALL resolve without errors
