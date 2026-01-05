# createRoutesView

Creates a component that renders the currently active route view.

## Import

```ts
import { createRoutesView } from '@argon-router/react';
```

## Usage

```tsx
import { createRoutesView } from '@argon-router/react';
import { HomeScreen, ProfileScreen, SettingsScreen } from './screens';

const RoutesView = createRoutesView({
  routes: [HomeScreen, ProfileScreen, SettingsScreen],
});

function App() {
  return (
    <RouterProvider router={router}>
      <RoutesView />
    </RouterProvider>
  );
}
```

## With Fallback

Show a component when no routes match:

```tsx
function NotFoundScreen() {
  return <div>404 - Page not found</div>;
}

const RoutesView = createRoutesView({
  routes: [HomeScreen, ProfileScreen],
  otherwise: NotFoundScreen,
});
```

## Configuration

### `routes` (required)

Array of route views created with `createRouteView` or `createLazyRouteView`:

```tsx
import { createRouteView } from '@argon-router/react';

const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => <div>Home</div>,
});

const ProfileScreen = createRouteView({
  route: profileRoute,
  view: () => <div>Profile</div>,
});

const RoutesView = createRoutesView({
  routes: [HomeScreen, ProfileScreen],
});
```

### `otherwise` (optional)

Component to render when no routes are active:

```tsx
const RoutesView = createRoutesView({
  routes: [HomeScreen, ProfileScreen],
  otherwise: () => <div>404 - Not Found</div>,
});
```

## Return Value

Returns a React component that:
- Renders the most recently opened route
- Automatically updates when route state changes
- Handles nested routes via `Outlet`
- Returns `null` or fallback when no routes are active

## How It Works

The routes view:
1. Uses `useOpenedViews` to track which routes are currently open
2. Renders the last (most recent) opened route
3. Provides outlet context for nested routes
4. Re-renders automatically when route state changes

## Nested Routes

For nested route structures, use `Outlet` in parent components:

```tsx
import { Outlet } from '@argon-router/react';

const ProfileScreen = createRouteView({
  route: profileRoute,
  view: () => (
    <div>
      <h1>Profile</h1>
      <nav>{/* Navigation */}</nav>
      <Outlet /> {/* Renders child routes */}
    </div>
  ),
  children: [
    createRouteView({ route: settingsRoute, view: SettingsComponent }),
    createRouteView({ route: friendsRoute, view: FriendsComponent }),
  ],
});

const RoutesView = createRoutesView({
  routes: [ProfileScreen],
});
```

## With Router Provider

`RouterProvider` must wrap the routes view:

```tsx
import { RouterProvider } from '@argon-router/react';
import { router } from './router';

const RoutesView = createRoutesView({
  routes: [HomeScreen, ProfileScreen],
});

function App() {
  return (
    <RouterProvider router={router}>
      <RoutesView />
    </RouterProvider>
  );
}
```

## Multiple Routes Views

You can create multiple routes views for different parts of your app:

```tsx
const MainRoutesView = createRoutesView({
  routes: [HomeScreen, AboutScreen],
});

const AdminRoutesView = createRoutesView({
  routes: [DashboardScreen, UsersScreen],
});

function App() {
  return (
    <RouterProvider router={router}>
      <MainRoutesView />
      <AdminRoutesView />
    </RouterProvider>
  );
}
```

## See Also

- [createRouteView](./create-route-view) - Create route views
- [createLazyRouteView](./create-lazy-route-view) - Lazy-loaded route views
- [RouterProvider](./router-provider) - Provide router to React tree
- [Outlet](./outlet) - Render nested routes
- [useOpenedViews](./use-opened-views) - Hook to track opened routes
