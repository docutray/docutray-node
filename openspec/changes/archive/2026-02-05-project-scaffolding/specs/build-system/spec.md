## ADDED Requirements

### Requirement: TypeScript strict compilation
The project SHALL have a `tsconfig.json` with `strict: true`, `target: "ES2022"`, and `moduleResolution: "bundler"`. The compiler MUST enforce strict type checking across all source files in `src/`.

#### Scenario: Strict mode catches type errors
- **WHEN** a source file contains an implicit `any` type
- **THEN** `npm run typecheck` SHALL exit with a non-zero code reporting the error

#### Scenario: Typecheck passes on valid code
- **WHEN** all source files have correct types
- **THEN** `npm run typecheck` SHALL exit with code 0

### Requirement: Dual ESM and CJS output
The project SHALL use tsup to produce dual-format output: ESM (`.mjs`) and CJS (`.js`) with corresponding TypeScript declaration files (`.d.mts`, `.d.ts`) and sourcemaps. The entry point MUST be `src/index.ts`.

#### Scenario: Build produces all output files
- **WHEN** `npm run build` is executed
- **THEN** the `dist/` directory SHALL contain `index.mjs`, `index.js`, `index.d.mts`, `index.d.ts`, and corresponding `.map` files

#### Scenario: Build cleans previous output
- **WHEN** `npm run build` is executed with a stale `dist/` directory
- **THEN** tsup SHALL clean the output directory before writing new files

### Requirement: Minimal source entry point
The project SHALL have a `src/index.ts` file that serves as the build entry point. It MUST be valid TypeScript so that build and typecheck commands succeed immediately after scaffolding.

#### Scenario: Entry point exists and is valid
- **WHEN** the project is freshly scaffolded
- **THEN** `src/index.ts` SHALL exist and `npm run build` SHALL succeed
