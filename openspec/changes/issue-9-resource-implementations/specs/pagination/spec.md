## MODIFIED Requirements

### Requirement: Page class
The SDK SHALL export a `Page<T>` class that represents a single page of results. It SHALL hold `data` (T[]) and `pagination` metadata (`{ total, page, limit }`). The `PageResponse<T>` interface SHALL use `data` and `pagination` fields instead of `items` and `next_cursor`.

#### Scenario: Accessing items
- **WHEN** a `Page<T>` is created with data
- **THEN** the `data` property SHALL contain the page's data items

### Requirement: Next page navigation
`Page<T>` SHALL provide a `hasNextPage()` method that returns `true` when more pages exist (computed from `page * limit < total`), and a `nextPage()` method that fetches the next page by incrementing the `page` query parameter.

#### Scenario: Multiple pages exist
- **WHEN** `hasNextPage()` is called on a page where `page * limit < total`
- **THEN** it SHALL return `true`

#### Scenario: Last page
- **WHEN** `hasNextPage()` is called on a page where `page * limit >= total`
- **THEN** it SHALL return `false`
