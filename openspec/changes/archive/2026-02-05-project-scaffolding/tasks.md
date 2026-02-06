## 1. TypeScript Configuration

- [x] 1.1 Create `tsconfig.json` with `strict: true`, `target: "ES2022"`, `moduleResolution: "bundler"`, and `outDir: "dist"`
- [x] 1.2 Create `src/index.ts` placeholder with a minimal export (e.g., `export {}`)

## 2. Build Configuration

- [x] 2.1 Create `tsup.config.ts` with dual ESM/CJS output, dts generation, sourcemaps, and clean mode
- [x] 2.2 Install devDependencies: `typescript`, `tsup`, `@types/node`

## 3. Test Configuration

- [x] 3.1 Create `vitest.config.ts` with node environment, v8 coverage provider, and 80% thresholds
- [x] 3.2 Install devDependencies: `vitest`, `@vitest/coverage-v8`, `msw`

## 4. Lint Configuration

- [x] 4.1 Install devDependency: `eslint`
- [x] 4.2 Create ESLint configuration for TypeScript (flat config format)

## 5. Documentation

- [x] 5.1 Create `CHANGELOG.md` following Keep a Changelog format with an initial Unreleased section

## 6. Validation

- [x] 6.1 Verify `npm run build` succeeds and produces expected output files in `dist/`
- [x] 6.2 Verify `npm run typecheck` exits with code 0
- [x] 6.3 Verify `npm run test` exits cleanly with no errors
- [x] 6.4 Verify `npm run lint` exits with code 0
