# createRoutesView

Creates routes view. Entry point for all routes. Works only in `<RouterProvider>`

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
