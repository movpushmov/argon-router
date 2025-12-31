# group

Create a virtual route that opens when any of the passed routes is opened, and closes when all passed routes are closed.

## API

```typescript
function group(routes: Route<any>[]): VirtualRoute
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `routes` | `Route<any>[]` | Array of routes to group together |

### Returns

`VirtualRoute` - A virtual route that tracks the combined state of all passed routes.

## Usage

### Basic Example

```ts
import { group, createRoute } from '@argon-router/core';

const signInRoute = createRoute({ path: '/auth/sign-in' });
const signUpRoute = createRoute({ path: '/auth/sign-up' });
const authorizationRoute = group([signInRoute, signUpRoute]);

signInRoute.open();  // authorizationRoute.$isOpened → true
signUpRoute.open();  // authorizationRoute.$isOpened → true
signInRoute.close(); // authorizationRoute.$isOpened → true (signUpRoute still open)
signUpRoute.close(); // authorizationRoute.$isOpened → false (all closed)
```

### Guard Multiple Routes

```ts
import { group, createRoute, createRouter } from '@argon-router/core';
import { sample } from 'effector';

const profileRoute = createRoute({ path: '/profile' });
const settingsRoute = createRoute({ path: '/settings' });
const dashboardRoute = createRoute({ path: '/dashboard' });

const authenticatedRoutes = group([profileRoute, settingsRoute, dashboardRoute]);

// Redirect to login if trying to access any authenticated route
sample({
  clock: authenticatedRoutes.opened,
  filter: () => !isAuthenticated(),
  target: loginRoute.open,
});
```

### Track Section State

```ts
import { group, createRoute } from '@argon-router/core';
import { useUnit } from 'effector-react';

const productsRoute = createRoute({ path: '/shop/products' });
const cartRoute = createRoute({ path: '/shop/cart' });
const checkoutRoute = createRoute({ path: '/shop/checkout' });

const shopSection = group([productsRoute, cartRoute, checkoutRoute]);

function ShopIndicator() {
  const isShopActive = useUnit(shopSection.$isOpened);
  
  return (
    <div className={isShopActive ? 'shop-active' : ''}>
      Shopping Section
    </div>
  );
}
```

## How It Works

The `group` function creates a virtual route that:
- Opens when **any** of the grouped routes opens
- Closes when **all** of the grouped routes close
- Tracks combined pending state (`$isPending`) from all routes

This is useful for:
- Protecting multiple routes with the same guard
- Showing UI indicators for route sections
- Tracking navigation state across related routes

## See Also

- [createVirtualRoute](/core/create-virtual-route) - Create custom virtual routes
- [createRoute](/core/create-route) - Create regular routes
- [chainRoute](/core/chain-route) - Create sequential route chains
