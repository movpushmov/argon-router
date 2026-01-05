# chainRoute

Create a virtual route that wraps an existing route with additional lifecycle hooks and conditions. Useful for implementing guards, loading data before navigation, or creating conditional navigation flows.

## API

```typescript
function chainRoute<T extends object | void = void>(
  props: ChainRouteProps<T>
): VirtualRoute<RouteOpenedPayload<T>, T>
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `props.route` | `Route<T>` | The route to wrap |
| `props.beforeOpen` | `Event \| Effect \| Array` | Unit(s) to execute when route opens |
| `props.openOn` | `Unit \| Unit[]` | Optional. Unit(s) that trigger the virtual route to open |
| `props.cancelOn` | `Unit \| Unit[]` | Optional. Unit(s) that close the virtual route and fire `cancelled` |

### Returns

`VirtualRoute<RouteOpenedPayload<T>, T>` - A virtual route with all standard virtual route properties plus a `cancelled` event.

## Usage

### Basic Authorization Guard

```ts
import { createRoute, chainRoute } from '@argon-router/core';
import { createEvent, createEffect, sample } from 'effector';

const profileRoute = createRoute({ path: '/profile' });

const authorized = createEvent();
const rejected = createEvent();

const checkAuthFx = createEffect(async () => {
  const isAuthorized = await checkUserAuth();
  if (!isAuthorized) throw new Error('Not authorized');
});

sample({
  clock: checkAuthFx.doneData,
  target: authorized,
});

sample({
  clock: checkAuthFx.failData,
  target: rejected,
});

const guardedProfile = chainRoute({
  route: profileRoute,
  beforeOpen: checkAuthFx,
  openOn: authorized,
  cancelOn: rejected,
});

// Redirect to login when cancelled
sample({
  clock: guardedProfile.cancelled,
  target: loginRoute.open,
});
```

### Load Data Before Route Opens

```ts
import { createRoute, chainRoute } from '@argon-router/core';
import { createEffect, sample } from 'effector';

const userRoute = createRoute<{ userId: string }>({ path: '/user/:userId' });

const loadUserDataFx = createEffect(async ({ params }: { params: { userId: string } }) => {
  return await fetchUser(params.userId);
});

const userRouteWithData = chainRoute({
  route: userRoute,
  beforeOpen: loadUserDataFx,
  openOn: loadUserDataFx.done,
});

// Use the loaded data
sample({
  clock: loadUserDataFx.doneData,
  fn: (data) => data.result,
  target: $currentUser,
});
```

### Multiple Before Open Effects

```ts
import { createRoute, chainRoute } from '@argon-router/core';
import { createEffect } from 'effector';

const dashboardRoute = createRoute({ path: '/dashboard' });

const checkAuthFx = createEffect(async () => {
  await verifyAuth();
});

const loadDashboardDataFx = createEffect(async () => {
  return await fetchDashboardData();
});

const guardedDashboard = chainRoute({
  route: dashboardRoute,
  // Effects run sequentially in order
  beforeOpen: [checkAuthFx, loadDashboardDataFx],
  openOn: loadDashboardDataFx.done,
  cancelOn: [checkAuthFx.fail, loadDashboardDataFx.fail],
});
```

### Chain Multiple Guards

```ts
import { createRoute, chainRoute } from '@argon-router/core';

const adminRoute = createRoute({ path: '/admin' });

// First check: authentication
const authenticatedRoute = chainRoute({
  route: adminRoute,
  beforeOpen: checkAuthFx,
  openOn: checkAuthFx.done,
  cancelOn: checkAuthFx.fail,
});

// Second check: admin role
const authorizedAdminRoute = chainRoute({
  route: authenticatedRoute,
  beforeOpen: checkAdminRoleFx,
  openOn: checkAdminRoleFx.done,
  cancelOn: checkAdminRoleFx.fail,
});

// Third check: load admin data
const adminRouteWithData = chainRoute({
  route: authorizedAdminRoute,
  beforeOpen: loadAdminDataFx,
  openOn: loadAdminDataFx.done,
});
```

### Conditional Navigation

```ts
import { createRoute, chainRoute } from '@argon-router/core';
import { createEvent, sample } from 'effector';

const purchaseRoute = createRoute({ path: '/purchase/:productId' });

const hasInventory = createEvent();
const outOfStock = createEvent();

const checkInventoryFx = createEffect(async ({ params }) => {
  const product = await fetchProduct(params.productId);
  if (product.stock === 0) throw new Error('Out of stock');
  return product;
});

sample({
  clock: checkInventoryFx.doneData,
  target: hasInventory,
});

sample({
  clock: checkInventoryFx.failData,
  target: outOfStock,
});

const validatedPurchase = chainRoute({
  route: purchaseRoute,
  beforeOpen: checkInventoryFx,
  openOn: hasInventory,
  cancelOn: outOfStock,
});

// Show error when out of stock
sample({
  clock: validatedPurchase.cancelled,
  fn: () => 'Product is out of stock',
  target: showErrorToast,
});
```

### With Multiple Cancel Conditions

```ts
import { createRoute, chainRoute } from '@argon-router/core';
import { createEvent } from 'effector';

const editorRoute = createRoute({ path: '/edit/:documentId' });

const documentLocked = createEvent();
const permissionDenied = createEvent();
const documentDeleted = createEvent();

const guardedEditor = chainRoute({
  route: editorRoute,
  beforeOpen: checkDocumentAccessFx,
  openOn: checkDocumentAccessFx.done,
  cancelOn: [documentLocked, permissionDenied, documentDeleted],
});

// Handle different cancellation reasons
sample({
  clock: guardedEditor.cancelled,
  source: {
    isLocked: documentLocked,
    isDenied: permissionDenied,
    isDeleted: documentDeleted,
  },
  fn: (reasons) => {
    if (reasons.isLocked) return 'Document is locked';
    if (reasons.isDenied) return 'Permission denied';
    if (reasons.isDeleted) return 'Document was deleted';
  },
  target: showErrorMessage,
});
```

## How It Works

1. When the original `route.opened` fires, `beforeOpen` effect(s) execute sequentially
2. If `openOn` is provided, the virtual route opens when those units trigger
3. If `cancelOn` units trigger, the virtual route closes and `cancelled` event fires
4. The virtual route's `$params` store contains the transformed route parameters

## Using the Cancelled Event

The virtual route includes a `cancelled` event that fires when navigation is prevented:

```ts
const guardedRoute = chainRoute({
  route: someRoute,
  beforeOpen: checkSomethingFx,
  openOn: checkSomethingFx.done,
  cancelOn: checkSomethingFx.fail,
});

// React to cancellation
sample({
  clock: guardedRoute.cancelled,
  target: showAccessDeniedMessage,
});
```

## Best Practices

### Use for Guards

Perfect for implementing authorization, permissions, and data loading:

```ts
// ✅ Good: Clear guard pattern
const guardedRoute = chainRoute({
  route: protectedRoute,
  beforeOpen: checkPermissionsFx,
  openOn: checkPermissionsFx.done,
  cancelOn: checkPermissionsFx.fail,
});
```

### Chain Multiple Concerns

Keep each concern separate by chaining multiple guards:

```ts
// ✅ Good: Separate authentication and authorization
const authenticated = chainRoute({
  route: baseRoute,
  beforeOpen: checkAuthFx,
  openOn: checkAuthFx.done,
  cancelOn: checkAuthFx.fail,
});

const authorized = chainRoute({
  route: authenticated,
  beforeOpen: checkRoleFx,
  openOn: checkRoleFx.done,
  cancelOn: checkRoleFx.fail,
});
```

### Handle All Cancel Cases

Always handle the `cancelled` event to provide user feedback:

```ts
sample({
  clock: guardedRoute.cancelled,
  target: redirectToLogin,
});
```

## See Also

- [createVirtualRoute](/core/create-virtual-route) - Create virtual routes
- [createRoute](/core/create-route) - Create regular routes
- [group](/core/group) - Group multiple routes
