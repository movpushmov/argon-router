# group

Create virtual route which opens when some passed routes is opened. Closes if all passed routes are closed.

### Basic example

```ts
import { group, createRoute } from '@argon-router/core';
import { createEvent, createEffect } from 'effector';

const signInRoute = createRoute({ path: '/auth/sign-in' });
const signUpRoute = createRoute({ path: '/auth/sign-up' });
const authorizationRoute = group([signInRoute, signUpRoute]);

signInRoute.open(); // authorizationRoute.$isOpened —> true
signUpRoute.open(); // authorizationRoute.$isOpened —> true
signInRoute.close(); // authorizationRoute.$isOpened —> true
signUpRoute.close(); // authorizationRoute.$isOpened —> false
```
