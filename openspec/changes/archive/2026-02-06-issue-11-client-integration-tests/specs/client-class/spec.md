## ADDED Requirements

### Requirement: DocuTray class exports
`src/client.ts` SHALL export a `DocuTray` class. `src/index.ts` SHALL export `DocuTray` as both a default export and a named export.

#### Scenario: Named import
- **WHEN** a user writes `import { DocuTray } from 'docutray'`
- **THEN** the `DocuTray` class SHALL be available

#### Scenario: Default import
- **WHEN** a user writes `import DocuTray from 'docutray'`
- **THEN** the `DocuTray` class SHALL be available

### Requirement: Constructor with ClientOptions
The `DocuTray` constructor SHALL accept a `ClientOptions` object (optional `apiKey`, `baseURL`, `timeout`, `maxRetries`, `fetch`). It SHALL instantiate an internal `APIClient` with the resolved options.

#### Scenario: Explicit API key
- **WHEN** `new DocuTray({ apiKey: 'sk-test' })` is called
- **THEN** the client SHALL use `'sk-test'` as the API key

#### Scenario: Custom base URL and timeout
- **WHEN** `new DocuTray({ apiKey: 'sk-test', baseURL: 'https://custom.api', timeout: 30000 })` is called
- **THEN** the internal `APIClient` SHALL use the provided baseURL and timeout

### Requirement: API key env var fallback
If `apiKey` is not provided in options, the constructor SHALL read `DOCUTRAY_API_KEY` from environment variables via `readEnv()`.

#### Scenario: Env var fallback
- **WHEN** `new DocuTray({})` is called and `DOCUTRAY_API_KEY=sk-env` is set
- **THEN** the client SHALL use `'sk-env'` as the API key

### Requirement: Missing API key error
If no API key is provided via options or environment variable, the constructor SHALL throw a `DocuTrayError` with a message indicating the key is missing.

#### Scenario: No key anywhere
- **WHEN** `new DocuTray({})` is called and `DOCUTRAY_API_KEY` is not set
- **THEN** the constructor SHALL throw `DocuTrayError`

### Requirement: Resource properties
The `DocuTray` class SHALL expose five readonly resource properties: `convert` (Convert), `identify` (Identify), `documentTypes` (DocumentTypes), `steps` (Steps), `knowledgeBases` (KnowledgeBases).

#### Scenario: Access convert resource
- **WHEN** `client.convert` is accessed
- **THEN** it SHALL be an instance of `Convert`

#### Scenario: Access all resources
- **WHEN** a `DocuTray` instance is created
- **THEN** `convert`, `identify`, `documentTypes`, `steps`, and `knowledgeBases` SHALL all be defined and be instances of their respective classes
