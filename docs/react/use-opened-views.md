# useOpenedViews

Hook that returns the currently opened route views, filtering out parent routes when their children are active.

## Import

```ts
import { useOpenedViews } from '@argon-router/react';
```

## Usage

```tsx
import { useOpenedViews } from '@argon-router/react';

function CustomRoutesRenderer() {
  const routes = [HomeScreen, ProfileScreen, SettingsScreen];
  const openedViews = useOpenedViews(routes);

  return (
    <div>
      {openedViews.map((view, index) => (
        <div key={index}>
          {createElement(view.view)}
        </div>
      ))}
    </div>
  );
}
```

## Parameters

### `routes` (required)

Array of route views to track:

```tsx
const routes = [
  createRouteView({ route: homeRoute, view: HomeComponent }),
  createRouteView({ route: profileRoute, view: ProfileComponent }),
];

const openedViews = useOpenedViews(routes);
```

## Return Value

Returns an array of currently opened route views:

```tsx
type RouteView = {
  route: Route<any> | Router;
  view: React.FC;
  children?: RouteView[];
};
```

The hook:
- Filters routes to only those that are currently opened (`$isOpened === true`)
- Removes parent routes when their child routes are active
- Updates automatically when route state changes

## How It Works

### Parent Filtering

When a child route is active, its parent is filtered out:

```tsx
const profileRoute = createRoute({ path: '/profile' });
const settingsRoute = createRoute({ path: '/settings', parent: profileRoute });

const routes = [
  createRouteView({ route: profileRoute, view: ProfileComponent }),
  createRouteView({ route: settingsRoute, view: SettingsComponent }),
];

// When settingsRoute.open() is called:
const openedViews = useOpenedViews(routes);
// Returns: [{ route: settingsRoute, view: SettingsComponent }]
// ProfileComponent is filtered out because its child is active
```

### Multiple Active Routes

Multiple sibling routes can be active simultaneously:

```tsx
const dialogRoute = createRoute(); // Pathless route
const modalRoute = createRoute();  // Pathless route

const routes = [
  createRouteView({ route: homeRoute, view: HomeComponent }),
  createRouteView({ route: dialogRoute, view: DialogComponent }),
  createRouteView({ route: modalRoute, view: ModalComponent }),
];

// When multiple routes are open:
homeRoute.open();
dialogRoute.open();
modalRoute.open();

const openedViews = useOpenedViews(routes);
// Returns: [HomeComponent, DialogComponent, ModalComponent]
```

## Custom Implementation

Use this hook to build custom route renderers:

### Stack Renderer

```tsx
function StackRenderer({ routes }) {
  const openedViews = useOpenedViews(routes);

  return (
    <div className="stack">
      {openedViews.map((view, index) => {
        const isTop = index === openedViews.length - 1;
        return (
          <div
            key={index}
            className={isTop ? 'active' : 'hidden'}
          >
            {createElement(view.view)}
          </div>
        );
      })}
    </div>
  );
}
```

### Layered Renderer

```tsx
function LayeredRenderer({ routes }) {
  const openedViews = useOpenedViews(routes);

  return (
    <div className="layers">
      {openedViews.map((view, index) => (
        <div
          key={index}
          className="layer"
          style={{ zIndex: index }}
        >
          {createElement(view.view)}
        </div>
      ))}
    </div>
  );
}
```

### Animated Transitions

```tsx
import { AnimatePresence, motion } from 'framer-motion';

function AnimatedRoutesRenderer({ routes }) {
  const openedViews = useOpenedViews(routes);
  const activeView = openedViews.at(-1);

  return (
    <AnimatePresence mode="wait">
      {activeView && (
        <motion.div
          key={activeView.route.path || 'route'}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
        >
          {createElement(activeView.view)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## With Effector Scope

The hook automatically works with Effector scope when used inside `Provider`:

```tsx
import { Provider, fork } from 'effector-react';

function App() {
  const scope = fork();

  return (
    <Provider value={scope}>
      <RouterProvider router={router}>
        <CustomRoutesRenderer />
      </RouterProvider>
    </Provider>
  );
}
```

## Reactivity

The hook re-renders when:
- A route opens or closes
- A route's `$isOpened` store changes
- Router's `$activeRoutes` changes (for Router items)

## See Also

- [createRoutesView](./create-routes-view) - Built-in routes renderer (uses this hook)
- [Outlet](./outlet) - Render nested routes (uses this hook)
- [createRouteView](./create-route-view) - Create route views
- [RouterProvider](./router-provider) - Provide router to React tree

