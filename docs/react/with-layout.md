# withLayout

Group routes by layout, so you don't need to pass `layout` property manually in all routes. Works for `createRouteView` and `createLazyRouteView`.

### Example

```ts
import {
  createRoutesView,
  createRouteView,
  withLayout,
} from '@argon-router/react';

import { ProfileScreen } from './profile';
import { SignInScreen } from './sign-in';
import { SignUpScreen } from './sign-up';

import { routes } from '@shared/routing';

import { AuthLayout } from '@layouts/auth';

export const RoutesView = createRoutesView({
  routes: [
    ...withLayout(AuthLayout, [
      createRouteView({ route: routes.signIn, view: SignInScreen }),
      createRouteView({ route: routes.signUp, view: SignUpScreen }),
    ]),
    createRouteView({ route: routes.profile, view: ProfileScreen }),
  ],
});
```
