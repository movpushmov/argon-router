# createRouteView

Creates route view. Accepts parameters `route` (argon-router route), `view` (component which rendered when route opened) and `layout`.

### Example

```tsx
import { createRouteView } from '@argon-router/react';
import { routes } from '@shared/routing';
import { MainLayout } from '@layouts';

function Profile() {
  return <>...</>;
}

export const ProfileScreen = createRouteView({
  route: routes.profile,
  view: Profile,
  layout: MainLayout,
});
```
