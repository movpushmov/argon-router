# createLazyRouteView

Creates lazy route view. Accepts parameters `route` (argon-router route), `view` (component which rendered when route opened), `fallback` (if route fail bundle load) and `layout`.

### Example

```tsx
// profile.tsx
export default function () {
  return <>...</>;
}
```

```ts
// index.ts
import { createLazyRouteView } from '@argon-router/react';
import { routes } from '@shared/routing';
import { MainLayout } from '@layouts';

export const ProfileScreen = createLazyRouteView({
  route: routes.profile,
  view: () => import('./profile'),
  fallback: () => ':(',
  layout: MainLayout,
});
```
