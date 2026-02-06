# Lint Config

ESLint configuration for source code quality.

## Requirements

### Requirement: ESLint configuration for TypeScript
The project SHALL have ESLint configured to lint TypeScript files in `src/`. The `eslint` package and `@types/node` MUST be installed as devDependencies.

#### Scenario: Lint command runs on source files
- **WHEN** `npm run lint` is executed
- **THEN** ESLint SHALL analyze all files in `src/` and report any violations

#### Scenario: Lint passes on clean code
- **WHEN** all source files follow the configured lint rules
- **THEN** `npm run lint` SHALL exit with code 0
