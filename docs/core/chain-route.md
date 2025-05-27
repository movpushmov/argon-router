# chainRoute

Create virtual route which opened on `openOn`, closed on `cancelOn` and run's `beforeOpen` when original route was opened.

*`beforeOpen`, `cancelOn` and `openOn` can be a single unit or an array of units.*

### Basic example

```ts
import { createRoute, chainRoute } from '@argon-router/core';
import { createEvent, createEffect } from 'effector';

const route = createRoute({ path: '/profile' });

const authorized = createEvent();
const rejected = createEvent();

const checkAuthorizationFx = createEffect(async ({ params }) => /* some logic */);

sample({
  clock: checkAuthorizationFx.doneData,
  target: authorized,
});

sample({
  clock: checkAuthorizationFx.failData,
  target: rejected,
});

const virtual = chainRoute({
  route,
  beforeOpen: checkAuthorizationFx,
  openOn: authorized,
  cancelOn: rejected,
});
```

> Note: you can use `virtual.cancelled` event if you want to check is route cancelled

### Chain already chained routes

```ts
import { createRoute, chainRoute } from '@argon-router/core';

const postRoute = createRoute({ path: '/post/:id' });

const authorizedRoute = chainRoute({ route: postRoute, /* ... */ });
const postLoadedRoute = chainRoute({ route: authorizedRoute, /* ... */ });
```
