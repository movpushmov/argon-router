# createRoutesView

Creates routes view. Entry point for all routes. Works only in `<RouterProvider>`

::: warning

**Be careful**: if for some reason several routes are active at once,
the layout will display the last one listed in the list.

:::

### Example

```tsx
import { createRoutesView } from '@argon-router/react';
import { router } from './router';
// feed screen & profile screen must be created with createRouteView!
import { FeedScreen, ProfileScreen } from './screens';

const RoutesView = createRoutesView({ routes: [FeedScreen, ProfileScreen] });

// then you can use it like react component:
function App() {
  return (
    <RouterProvider router={router}>
      <RoutesView />
    </RouterProvider>
  );
}
```