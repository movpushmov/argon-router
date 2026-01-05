# createRoute

Create a route with or without a path. Routes are the building blocks of navigation in argon-router.

## API

```typescript
// Path route
function createRoute<T extends string>(
  config: CreateRouteConfig<T>
): PathRoute<ParseUrlParams<T>>

// Pathless route
function createRoute<Params extends object | void = void>(
  config?: WithBaseRouteConfig
): PathlessRoute<Params>
```

### Config

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Optional. URL path template with parameters |
| `parent` | `Route<any>` | Optional. Parent route for nesting |
| `beforeOpen` | `Effect[]` | Optional. Effects to run before opening |

### Returns

Returns either `PathRoute<T>` or `PathlessRoute<T>` depending on whether `path` is provided.

| Property | Type | Description |
|----------|------|-------------|
| `$params` | `Store<T>` | Route parameters |
| `$isOpened` | `Store<boolean>` | Whether route (or its children) are opened |
| `$isPending` | `Store<boolean>` | Whether beforeOpen effects are running |
| `open` | `EventCallable<RouteOpenedPayload<T>>` | Open the route and its parents |
| `opened` | `Event<RouteOpenedPayload<T>>` | Fires when route opens (client or server) |
| `openedOnServer` | `Event<RouteOpenedPayload<T>>` | Fires when opened on server (SSR) |
| `openedOnClient` | `Event<RouteOpenedPayload<T>>` | Fires when opened on client |
| `closed` | `Event<void>` | Fires when route closes |
| `path` | `string` | *PathRoute only*: The route's path template |
| `parent` | `Route<any>` | Optional. The parent route |
| `beforeOpen` | `Effect[]` | Optional. Before-open effects |

## Usage

### Path Routes

Routes with paths for URL-based navigation:

```ts
import { createRoute } from '@argon-router/core';

// Basic route
const homeRoute = createRoute({ path: '/' });
homeRoute.open();

// Route with parameters
const userRoute = createRoute({ path: '/user/:id' });
userRoute.open({ params: { id: '123' } });

// Route with query
const searchRoute = createRoute({ path: '/search' });
searchRoute.open({ query: { q: 'hello' } });
```

### Pathless Routes

Routes without paths for dialogs, modals, or other non-URL navigation:

```ts
import { createRoute } from '@argon-router/core';

// Without parameters
const dialogRoute = createRoute();
dialogRoute.open();

// With typed parameters
const confirmDialog = createRoute<{ title: string; message: string }>();
confirmDialog.open({
  params: { title: 'Delete', message: 'Are you sure?' },
});
```

::: warning Register Pathless Routes
Pathless routes must be assigned a path when registered in the router:

```ts
import { createRouter } from '@argon-router/core';

const router = createRouter({
  routes: [
    homeRoute, // Has path: '/'
    { path: '/dialog', route: dialogRoute }, // Assign path to pathless route
  ],
});
```
:::

### Path Parameters

Path parameters are automatically parsed and type-checked:

```ts
import { createRoute } from '@argon-router/core';

// String parameters (default)
const userRoute = createRoute({ path: '/user/:id' });
//    ^- Route<{ id: string }>

userRoute.open({ params: { id: '123' } });
```

#### Typed Parameters

Specify parameter types for validation and type safety:

```ts
// Number parameters
const postRoute = createRoute({ path: '/post/:id<number>' });
//    ^- Route<{ id: number }>

postRoute.open({ params: { id: 42 } });

// Union types
const modeRoute = createRoute({ path: '/edit/:mode<create|update>' });
//    ^- Route<{ mode: 'create' | 'update' }>

modeRoute.open({ params: { mode: 'create' } });

// Multiple parameters
const blogRoute = createRoute({
  path: '/blog/:year<number>/:month<number>/:slug',
});
//    ^- Route<{ year: number; month: number; slug: string }>

blogRoute.open({
  params: { year: 2024, month: 1, slug: 'hello-world' },
});
```

See [@argon-router/paths](https://github.com/movpushmov/argon-router/tree/main/packages/argon-router-paths#supported-types) for all supported parameter types and modifiers.

### Nested Routes (Parent)

Create route hierarchies where child routes inherit their parent's path and lifecycle:

```ts
import { createRoute } from '@argon-router/core';

const profileRoute = createRoute({ path: '/profile/:userId' });

// Child routes inherit parent path
const friendsRoute = createRoute({
  path: '/friends',
  parent: profileRoute,
});
//    Full path: /profile/:userId/friends

const postsRoute = createRoute({
  path: '/posts',
  parent: profileRoute,
});
//    Full path: /profile/:userId/posts

// Opening child opens parent
postsRoute.open({ params: { userId: '123' } });
// profileRoute.$isOpened → true
// postsRoute.$isOpened → true
```

#### Parent Lifecycle

Parent routes open automatically when children open:

```ts
import { sample } from 'effector';

const parentRoute = createRoute({ path: '/parent' });
const childRoute = createRoute({ path: '/child', parent: parentRoute });

// Track parent opening
sample({
  clock: parentRoute.opened,
  fn: () => console.log('Parent opened'),
});

// Opens both parent and child
childRoute.open();
```

#### Parent beforeOpen Effects

```ts
import { createEffect } from 'effector';

const checkAuthFx = createEffect(async () => {
  return await verifyAuth();
});

const dashboardRoute = createRoute({
  path: '/dashboard',
  beforeOpen: [checkAuthFx],
});

const settingsRoute = createRoute({
  path: '/settings',
  parent: dashboardRoute, // Inherits checkAuthFx
});

// checkAuthFx runs before opening
settingsRoute.open();
```

### Before Open Effects

Run effects before a route opens:

```ts
import { createRoute } from '@argon-router/core';
import { createEffect, sample } from 'effector';

const loadUserFx = createEffect(async () => {
  return await fetchUser();
});

const profileRoute = createRoute({
  path: '/profile',
  beforeOpen: [loadUserFx],
});

// loadUserFx executes, then route opens
profileRoute.open();

// Track loading state
sample({
  clock: profileRoute.$isPending,
  fn: (isPending) => console.log('Loading:', isPending),
});
```

### Open with Query Parameters

```ts
const searchRoute = createRoute({ path: '/search' });

searchRoute.open({
  query: { q: 'typescript', sort: 'recent' },
});
// URL: /search?q=typescript&sort=recent
```

### Replace History Entry

```ts
const route = createRoute({ path: '/page' });

route.open({ replace: true });
// Replaces current history entry instead of adding new one
```

## Best Practices

### Use Path Routes for URLs

Use path routes when the route should be reflected in the browser URL:

```ts
// ✅ Good: URL-based navigation
const productsRoute = createRoute({ path: '/products' });
const productRoute = createRoute({ path: '/product/:id' });
```

### Use Pathless Routes for UI State

Use pathless routes for UI elements that don't need URLs:

```ts
// ✅ Good: UI state without URL
const confirmDialog = createRoute<{ message: string }>();
const drawer = createRoute();
const tooltip = createRoute<{ text: string }>();
```

### Type Your Parameters

Always specify parameter types for type safety:

```ts
// ✅ Good: Typed parameters
const route = createRoute({ path: '/user/:id<number>' });

// ❌ Bad: Untyped (defaults to string)
const route = createRoute({ path: '/user/:id' });
```

### Use Parent for Shared Logic

Extract common path prefixes and guards into parent routes:

```ts
// ✅ Good: Shared auth guard
const adminRoute = createRoute({
  path: '/admin',
  beforeOpen: [checkAdminAuthFx],
});

const usersRoute = createRoute({ path: '/users', parent: adminRoute });
const settingsRoute = createRoute({ path: '/settings', parent: adminRoute });

// ❌ Bad: Duplicate guards
const usersRoute = createRoute({
  path: '/admin/users',
  beforeOpen: [checkAdminAuthFx],
});
const settingsRoute = createRoute({
  path: '/admin/settings',
  beforeOpen: [checkAdminAuthFx],
});
```

## See Also

- [createRouter](/core/create-router) - Create router with routes
- [createVirtualRoute](/core/create-virtual-route) - Create virtual routes
- [chainRoute](/core/chain-route) - Wrap routes with guards
- [@argon-router/paths](https://github.com/movpushmov/argon-router/tree/main/packages/argon-router-paths) - Path parameter syntax
