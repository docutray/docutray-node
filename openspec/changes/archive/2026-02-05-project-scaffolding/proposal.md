## Why

The project has a `package.json` and `README.md` but cannot build, test, or lint — there are no TypeScript, build, test, or lint configuration files, and no devDependencies installed. This scaffolding is the foundation that unblocks all subsequent implementation phases (core HTTP layer, types, resources, client). Ref: #1

## What Changes

- Add `tsconfig.json` with strict mode, ES2022 target, and bundler module resolution
- Add `tsup.config.ts` for dual ESM (.mjs) + CJS (.cjs) output with dts and sourcemaps
- Add `vitest.config.ts` with v8 coverage provider and 80% thresholds
- Install all devDependencies: `typescript`, `tsup`, `vitest`, `@vitest/coverage-v8`, `msw`, `eslint`, `@types/node`
- Create `CHANGELOG.md` following Keep a Changelog format
- Create minimal `src/index.ts` placeholder so build/typecheck pass

## Capabilities

### New Capabilities
- `build-system`: TypeScript compilation and dual-format bundling via tsup
- `test-framework`: Test runner configuration with vitest, coverage thresholds, and msw for HTTP mocking
- `lint-config`: ESLint configuration for source code quality

### Modified Capabilities
<!-- No existing specs to modify — this is the first implementation phase. -->

## Impact

- **Config files**: `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts` added to project root
- **Dependencies**: `package.json` updated with devDependencies, `package-lock.json` generated
- **Source**: `src/index.ts` created as entry point placeholder
- **Docs**: `CHANGELOG.md` added to project root
- **Build output**: `dist/` directory will be generated (already in `.gitignore`)
