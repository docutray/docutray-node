## Context

The docutray Node.js SDK has a `package.json` with scripts defined (`build`, `test`, `typecheck`, `lint`) but no configuration files or devDependencies to support them. No `src/` directory exists yet. This change establishes the toolchain so all subsequent phases can build, test, and lint their code.

## Goals / Non-Goals

**Goals:**
- Establish a working TypeScript build pipeline producing dual ESM + CJS output
- Configure vitest with coverage thresholds to enforce test quality from the start
- Install all devDependencies needed for the SDK development lifecycle
- Create a minimal `src/index.ts` so that build/typecheck/test commands pass immediately

**Non-Goals:**
- Implementing any SDK functionality (client, HTTP layer, resources)
- Configuring CI/CD pipelines
- Publishing to npm
- ESLint rule customization beyond basic TypeScript support

## Decisions

### TypeScript target: ES2022 with bundler module resolution
ES2022 aligns with Node.js 18+ (the minimum engine), providing native support for top-level await, private fields, and `Array.at()`. Bundler module resolution is recommended by tsup for projects that compile before distribution — it allows bare specifier imports without `.js` extensions.

**Alternative considered**: `NodeNext` module resolution — rejected because it requires `.js` extensions in imports which adds friction for a library that is always compiled.

### tsup for bundling (not plain tsc)
tsup wraps esbuild for fast compilation and natively supports dual ESM/CJS output, dts generation, and sourcemaps in a single config. This matches the pattern used by stripe-node and similar SDKs.

**Alternative considered**: Plain `tsc` with two tsconfig files — rejected due to complexity of maintaining dual output and no dts bundling support.

### vitest with v8 coverage at 80% thresholds
vitest integrates natively with TypeScript and ESM without extra transform config. v8 coverage is faster than istanbul for Node.js projects. 80% threshold on lines/branches/functions/statements enforces quality without being unreasonably strict for an early-stage project.

**Alternative considered**: jest — rejected because it requires additional transform configuration for ESM + TypeScript.

### msw included for future HTTP mocking
The SDK is an API wrapper, so HTTP-level mocking will be essential. Including msw now avoids a mid-development dependency addition. It will be used in later phases for testing the HTTP layer.

## Risks / Trade-offs

- **[Placeholder src/index.ts may be forgotten]** → It will be replaced in the next phase (core layer implementation), and its emptiness will cause coverage reports to show 0% until real code is added.
- **[Coverage thresholds may block CI early]** → Thresholds only apply when running `test:coverage`, not `test`. Standard `npm test` will pass even with no tests.
