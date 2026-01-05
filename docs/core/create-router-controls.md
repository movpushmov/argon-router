# createRouterControls

Create the core navigation controls for managing browser history, URL paths, and query parameters. These controls are typically used internally by `createRouter`, but can also be used independently for custom routing solutions.

## API

```typescript
function createRouterControls(): RouterControls
```

### Returns

`RouterControls` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `$history` | `Store<RouterAdapter \| null>` | Current history adapter instance |
| `$locationState` | `Store<LocationState>` | Current path and query state |
| `$query` | `Store<Query>` | Current query parameters |
| `$path` | `Store<string>` | Current pathname |
| `setHistory` | `Event<RouterAdapter>` | Initialize controls with history adapter |
| `navigate` | `Event<NavigatePayload>` | Navigate to a path with query parameters |
| `back` | `Event<void>` | Navigate back in history |
| `forward` | `Event<void>` | Navigate forward in history |
| `locationUpdated` | `Event<{ pathname, query }>` | Fires when location changes |
| `trackQuery` | `function` | Create query parameter trackers |

## Usage

### Basic Setup

```ts
import { createRouterControls, historyAdapter } from '@argon-router/core';
import { createBrowserHistory } from 'history';

const controls = createRouterControls();

// Initialize with browser history
controls.setHistory(historyAdapter(createBrowserHistory()));
```

::: warning Initialization Required
Router controls must be initialized with `setHistory` before use. Without a history adapter, navigation methods will throw errors.
:::

### Navigate to Paths

```ts
import { sample } from 'effector';

// Navigate to a new path
sample({
  clock: goToHomePage,
  fn: () => ({ path: '/' }),
  target: controls.navigate,
});

// Navigate with query parameters
sample({
  clock: searchSubmitted,
  fn: (searchTerm) => ({
    path: '/search',
    query: { q: searchTerm },
  }),
  target: controls.navigate,
});

// Replace current history entry
sample({
  clock: updateFilters,
  fn: (filters) => ({
    query: { filters },
    replace: true, // Don't add new history entry
  }),
  target: controls.navigate,
});
```

### Update Query Parameters

```ts
import { sample } from 'effector';

// Add query parameters while keeping current path
sample({
  clock: filterChanged,
  fn: (filter) => ({
    query: { filter, page: '1' },
  }),
  target: controls.navigate,
});

// Clear specific query parameter
sample({
  clock: clearSearch,
  fn: () => ({ query: { q: undefined } }),
  target: controls.navigate,
});
```

### Navigate Back/Forward

```ts
import { sample } from 'effector';

// Browser back button
sample({
  clock: backButtonClicked,
  target: controls.back,
});

// Browser forward button
sample({
  clock: forwardButtonClicked,
  target: controls.forward,
});
```

### Read Current State

```ts
import { useUnit } from 'effector-react';

function CurrentLocation() {
  const path = useUnit(controls.$path);
  const query = useUnit(controls.$query);

  return (
    <div>
      <p>Path: {path}</p>
      <p>Query: {JSON.stringify(query)}</p>
    </div>
  );
}
```

### Track Query Parameters

```ts
const $searchQuery = controls.trackQuery('q');
const $pageNumber = controls.trackQuery('page', {
  defaultValue: '1',
});

// Use in components
function SearchResults() {
  const query = useUnit($searchQuery);
  const page = useUnit($pageNumber);

  return <div>Searching for "{query}" (page {page})</div>;
}
```

### Server-Side Rendering

```ts
import { createRouterControls, historyAdapter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { fork, allSettled } from 'effector';

const controls = createRouterControls();
const scope = fork();

// Initialize with memory history for SSR
await allSettled(controls.setHistory, {
  scope,
  params: historyAdapter(createMemoryHistory({
    initialEntries: ['/products/123'],
  })),
});
```

### Custom History Adapter

```ts
import { createRouterControls } from '@argon-router/core';

const controls = createRouterControls();

// Use custom adapter
const customAdapter = {
  location: {
    pathname: '/current-path',
    search: '?query=value',
  },
  push: (location) => {
    console.log('Navigate to:', location);
  },
  replace: (location) => {
    console.log('Replace with:', location);
  },
  goBack: () => console.log('Go back'),
  goForward: () => console.log('Go forward'),
  listen: (listener) => {
    // Subscribe to location changes
    return {
      unsubscribe: () => {
        // Cleanup
      },
    };
  },
};

controls.setHistory(customAdapter);
```

### React to Location Changes

```ts
import { sample } from 'effector';

// Track all navigation
sample({
  clock: controls.locationUpdated,
  fn: ({ pathname, query }) => {
    console.log('Navigated to:', pathname, query);
  },
});

// Analytics tracking
sample({
  clock: controls.locationUpdated,
  fn: ({ pathname }) => ({
    event: 'pageview',
    path: pathname,
  }),
  target: sendAnalyticsFx,
});
```

### Derive State from Path

```ts
import { combine } from 'effector';

const $isHomePage = controls.$path.map((path) => path === '/');

const $currentSection = controls.$path.map((path) => {
  if (path.startsWith('/docs')) return 'docs';
  if (path.startsWith('/blog')) return 'blog';
  return 'home';
});

const $breadcrumbs = controls.$path.map((path) => {
  return path.split('/').filter(Boolean);
});
```

## NavigatePayload

The `navigate` event accepts the following payload:

```typescript
interface NavigatePayload {
  path?: string;      // Optional: new pathname
  query?: Query;      // Optional: query parameters
  replace?: boolean;  // Optional: replace history entry (default: false)
}
```

## Query Type

Query parameters are represented as:

```typescript
type Query = Record<string, string | string[] | undefined>;
```

Examples:
```ts
// Single value
{ search: 'apple' }

// Multiple values
{ tags: ['javascript', 'typescript'] }

// Remove parameter
{ filter: undefined }
```

## Best Practices

### Use createRouter Instead

For most applications, use `createRouter` which includes controls automatically:

```ts
// ✅ Recommended for most cases
import { createRouter } from '@argon-router/core';

const router = createRouter({
  routes: [...],
  controls: createRouterControls(),
});
```

### Initialize Early

Initialize history adapter as early as possible:

```ts
// In app entry point
import { createBrowserHistory } from 'history';

controls.setHistory(historyAdapter(createBrowserHistory()));
```

### Batch Query Updates

Use `replace: true` when updating query parameters frequently:

```ts
// ❌ Creates multiple history entries
controls.navigate({ query: { page: '1' } });
controls.navigate({ query: { filter: 'active' } });

// ✅ Single history entry
controls.navigate({
  query: { page: '1', filter: 'active' },
  replace: true,
});
```

## See Also

- [createRouter](/core/create-router) - Create complete router with controls
- [Adapters](/core/adapters) - History adapters and custom adapter creation
- [trackQuery](/core/track-query) - Track individual query parameters
