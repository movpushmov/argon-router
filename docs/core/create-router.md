# createRouter

Creates a router instance that manages navigation state and routes.

## Basic Usage

```ts
import { createRouter } from '@argon-router/core';
import { homeRoute, profileRoute } from './routes';

const router = createRouter({
  routes: [homeRoute, profileRoute],
});
```

::: warning
Router must be initialized with `setHistory` event using history from the `history` package:

```ts
import { createBrowserHistory } from 'history';
import { historyAdapter } from '@argon-router/core';

const history = createBrowserHistory();
router.setHistory(historyAdapter(history));
```

For React apps with Effector scope:

```ts
import { createRoot } from 'react-dom/client';
import { allSettled, fork } from 'effector';
import { createBrowserHistory } from 'history';
import { Provider } from 'effector-react';
import { historyAdapter } from '@argon-router/core';

const root = createRoot(document.getElementById('root')!);

async function render() {
  const scope = fork();
  const history = createBrowserHistory();

  await allSettled(router.setHistory, {
    scope,
    params: historyAdapter(history),
  });

  root.render(
    <Provider value={scope}>
      <App />
    </Provider>
  );
}

render();
```
:::

## Configuration

### `routes` (required)

Array of routes to register. Can include:
- **Path routes** - routes with paths
- **Pathless routes** - routes without paths (must assign path here)
- **Nested routers** - other router instances

```ts
const dialogRoute = createRoute(); // Pathless route

const router = createRouter({
  routes: [
    homeRoute,                              // Path route
    profileRoute,                           // Path route
    { path: '/dialog', route: dialogRoute }, // Pathless route with assigned path
    nestedRouter,                           // Nested router
  ],
});
```

### `base` (optional)

Base path prefix for all routes in this router:

```ts
const apiRouter = createRouter({
  base: '/api',
  routes: [usersRoute, postsRoute], // Will be /api/users, /api/posts
});
```

### `controls` (optional)

Custom router controls instance (for advanced use cases):

```ts
import { createRouterControls } from '@argon-router/core';

const controls = createRouterControls();

const router = createRouter({
  routes: [homeRoute],
  controls, // Use custom controls
});
```

## Navigation

### Direct Navigation

Use `navigate` event to navigate programmatically:

```ts
import { sample } from 'effector';

// Navigate to path
sample({
  clock: goToPage,
  fn: () => ({ path: '/page' }),
  target: router.navigate,
});

// Update query parameters
sample({
  clock: addQuery,
  fn: () => ({ query: { param1: 'hello', params2: [1, 2] } }),
  target: router.navigate,
});

// Navigate with replace
sample({
  clock: replacePage,
  fn: () => ({ path: '/new-page', replace: true }),
  target: router.navigate,
});
```

### Route-based Navigation

Open routes directly (recommended):

```ts
homeRoute.open();
profileRoute.open({ params: { id: '123' } });
profileRoute.open({ query: { tab: 'posts' }, replace: true });
```

## Reading State

### Current Path

```ts
router.$path.watch((path) => {
  console.log('Current path:', path);
});

// Or with map
const isHomePage = router.$path.map((path) => path === '/home');
```

### Query Parameters

```ts
router.$query.watch((query) => {
  console.log('Query params:', query);
});

// Extract specific param
const searchQuery = router.$query.map((query) => query.search);
```

### Active Routes

```ts
router.$activeRoutes.watch((routes) => {
  console.log('Currently active routes:', routes);
});
```

## History Navigation

```ts
// Go back
router.back();

// Go forward
router.forward();
```

## Dynamic Route Registration

Register routes after router creation:

```ts
const router = createRouter({
  routes: [homeRoute],
});

// Later...
router.registerRoute(newRoute);
router.registerRoute({ path: '/modal', route: modalRoute });
```

## Nested Routers

Routers can be nested to create modular route structures:

```ts
const adminRouter = createRouter({
  base: '/admin',
  routes: [dashboardRoute, usersRoute, settingsRoute],
});

const mainRouter = createRouter({
  routes: [
    homeRoute,
    aboutRoute,
    adminRouter, // Nested router
  ],
});
```

## API Reference

| Name            | Type                                | Description                                   |
| --------------- | ----------------------------------- | --------------------------------------------- |
| `$query`        | `Store<Query>`                      | Current query parameters                      |
| `$path`         | `Store<string>`                     | Current path                                  |
| `$history`      | `Store<RouterAdapter \| null>`      | Current history adapter                       |
| `$activeRoutes` | `Store<Route<any>[]>`               | Currently active routes                       |
| `back`          | `EventCallable<void>`               | Navigate back (if possible)                   |
| `forward`       | `EventCallable<void>`               | Navigate forward (if possible)                |
| `navigate`      | `EventCallable<NavigatePayload>`    | Navigate to path with query                   |
| `setHistory`    | `EventCallable<RouterAdapter>`      | Initialize router with history adapter        |
| `trackQuery`    | `(config) => QueryTracker`          | Track query parameters, see [trackQuery](./track-query.md) |
| `registerRoute` | `(route: InputRoute) => void`       | Dynamically register a route                  |
| `ownRoutes`     | `MappedRoute[]`                     | Routes owned by this router                   |
| `knownRoutes`   | `MappedRoute[]`                     | All known routes (including nested)           |

## Types

### NavigatePayload

```ts
type NavigatePayload = {
  path?: string;      // Path to navigate to
  query?: Query;      // Query parameters
  replace?: boolean;  // Replace instead of push
};
```

### Query

```ts
type Query = Record<string, string | null | Array<string | null>>;
```

### InputRoute

```ts
type InputRoute =
  | PathRoute<any>                               // Route with path
  | { path: string; route: PathlessRoute<any> }  // Pathless route with assigned path
  | Router;                                      // Nested router
```
