# pagination Specification

## Purpose
TBD - created by archiving change issue-3-core-layer. Update Purpose after archive.
## Requirements
### Requirement: Page class
The SDK SHALL export a `Page<T>` class that represents a single page of results. It SHALL hold `items` (T[]) and pagination metadata.

#### Scenario: Accessing items
- **WHEN** a `Page<T>` is created with items
- **THEN** the `items` property SHALL contain the page's data items

### Requirement: Next page navigation
`Page<T>` SHALL provide a `hasNextPage()` method that returns `true` when more pages exist, and a `nextPage()` method that fetches the next page.

#### Scenario: Multiple pages exist
- **WHEN** `hasNextPage()` is called on a page with a next cursor
- **THEN** it SHALL return `true`

#### Scenario: Last page
- **WHEN** `hasNextPage()` is called on the final page
- **THEN** it SHALL return `false`

### Requirement: Page-level async iteration
`Page<T>` SHALL provide an `iterPages()` method returning an `AsyncIterableIterator<Page<T>>` that yields each page in sequence.

#### Scenario: Iterating pages
- **WHEN** `for await (const page of firstPage.iterPages())` is used
- **THEN** it SHALL yield each page starting from the current page through the last page

### Requirement: Item-level async iteration
`Page<T>` SHALL provide an `autoPagingIter()` method returning an `AsyncIterableIterator<T>` that yields individual items across all pages.

#### Scenario: Iterating all items
- **WHEN** `for await (const item of firstPage.autoPagingIter())` is used
- **THEN** it SHALL yield every item from every page in order

### Requirement: Collect to array with safety limit
`Page<T>` SHALL provide a `toArray({ limit })` method that collects items across pages into an array. The `limit` parameter SHALL cap the maximum number of items collected to prevent unbounded memory usage.

#### Scenario: Collecting with limit
- **WHEN** `toArray({ limit: 50 })` is called on a paginated result with 200 total items
- **THEN** it SHALL return an array of exactly 50 items

#### Scenario: Collecting fewer than limit
- **WHEN** `toArray({ limit: 100 })` is called on a result with 30 total items
- **THEN** it SHALL return an array of 30 items

