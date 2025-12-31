# React

React bindings for Argon Router, providing hooks and components for seamless integration.

## Overview

`@argon-router/react` provides React-specific utilities to use Argon Router in your React applications:

- **Route Views** - Connect routes to React components
- **Navigation Components** - Link and navigation helpers
- **Hooks** - Access router state in components
- **Layouts** - Wrap multiple routes with shared layouts

## Installation

```bash
npm install @argon-router/react @argon-router/core effector effector-react react
```

## Key Concepts

### Route Views

Route Views connect Argon Router routes to React components:

```tsx
import { createRouteView } from '@argon-router/react';

const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => <div>Home</div>,
});
```

### Router Provider

Provide the router to your React tree:

```tsx
import { RouterProvider } from '@argon-router/react';

function App() {
  return (
    <RouterProvider router={router}>
      <YourApp />
    </RouterProvider>
  );
}
```

### Routes View

Render the currently opened route:

```tsx
import { createRoutesView } from '@argon-router/react';

const RoutesView = createRoutesView({
  routes: [HomeScreen, ProfileScreen, SettingsScreen],
  otherwise: NotFoundScreen,
});

function App() {
  return <RoutesView />;
}
```

## React APIs

### Component Creation

- [createRouteView](/react/create-route-view) - Create a route view component
- [createLazyRouteView](/react/create-lazy-route-view) - Create a lazy-loaded route view
- [createRoutesView](/react/create-routes-view) - Create a routes renderer

### Navigation

- [Link](/react/link) - Navigation link component
- [useRouter](/react/use-router) - Access router in components

### Utilities

- [withLayout](/react/with-layout) - Wrap routes with shared layouts

## Quick Example

```tsx
import { createRouter, createRoute } from '@argon-router/core';
import {
  RouterProvider,
  createRouteView,
  createRoutesView,
  Link,
} from '@argon-router/react';

// 1. Create routes
const homeRoute = createRoute({ path: '/home' });
const aboutRoute = createRoute({ path: '/about' });

// 2. Create router
const router = createRouter({
  routes: [homeRoute, aboutRoute],
});

// 3. Create route views
const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => (
    <div>
      <h1>Home</h1>
      <Link to={aboutRoute}>Go to About</Link>
    </div>
  ),
});

const AboutScreen = createRouteView({
  route: aboutRoute,
  view: () => (
    <div>
      <h1>About</h1>
      <Link to={homeRoute}>Go to Home</Link>
    </div>
  ),
});

// 4. Create routes view
const RoutesView = createRoutesView({
  routes: [HomeScreen, AboutScreen],
});

// 5. Use in app
function App() {
  return (
    <RouterProvider router={router}>
      <RoutesView />
    </RouterProvider>
  );
}
```

## Using Route Parameters

Access route parameters with Effector React hooks:

```tsx
import { useUnit } from 'effector-react';

const userRoute = createRoute({ path: '/user/:id' });

const UserScreen = createRouteView({
  route: userRoute,
  view: () => {
    const params = useUnit(userRoute.$params);
    return <div>User ID: {params.id}</div>;
  },
});
```

## Lazy Loading

Load route components on demand:

```tsx
import { createLazyRouteView } from '@argon-router/react';

const ProfileScreen = createLazyRouteView({
  route: profileRoute,
  view: () => import('./screens/ProfileScreen'),
  fallback: () => <div>Loading...</div>,
});
```

## Layouts

Share layouts across multiple routes:

```tsx
import { withLayout } from '@argon-router/react';

const MainLayout = ({ children }) => (
  <div>
    <header>Header</header>
    {children}
    <footer>Footer</footer>
  </div>
);

const RoutesView = createRoutesView({
  routes: [
    ...withLayout(MainLayout, [
      HomeScreen,
      AboutScreen,
      ContactScreen,
    ]),
    LoginScreen, // Without layout
  ],
});
```

## Type Safety

Route parameters are type-safe in components:

```tsx
const postRoute = createRoute({ path: '/post/:id' });
// Type: Route<{ id: string }>

const PostScreen = createRouteView({
  route: postRoute,
  view: () => {
    const params = useUnit(postRoute.$params);
    // params is typed as { id: string }
    return <div>Post {params.id}</div>;
  },
});
```

## Next Steps

- [createRouteView](/react/create-route-view) - Create route views
- [createRoutesView](/react/create-routes-view) - Render routes
- [Link](/react/link) - Navigation links
- [Core Package](/core/create-router) - Learn about core concepts

