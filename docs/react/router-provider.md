# RouterProvider

Context provider component that makes the router available to all child components.

## Import

```ts
import { RouterProvider } from '@argon-router/react';
```

## Usage

```tsx
import { RouterProvider } from '@argon-router/react';
import { router } from './router';

function App() {
  return (
    <RouterProvider router={router}>
      <YourApp />
    </RouterProvider>
  );
}
```

## Props

### `router` (required)

The router instance created with `createRouter`:

```tsx
import { createRouter, createRoute } from '@argon-router/core';

const homeRoute = createRoute({ path: '/home' });
const router = createRouter({
  routes: [homeRoute],
});

function App() {
  return (
    <RouterProvider router={router}>
      <YourApp />
    </RouterProvider>
  );
}
```

### `children` (optional)

React components to render:

```tsx
<RouterProvider router={router}>
  <Layout>
    <RoutesView />
  </Layout>
</RouterProvider>
```

## With Effector Scope

For SSR or testing, wrap with Effector's Provider:

```tsx
import { fork, Provider } from 'effector-react';
import { RouterProvider } from '@argon-router/react';

function App() {
  const scope = fork();

  return (
    <Provider value={scope}>
      <RouterProvider router={router}>
        <YourApp />
      </RouterProvider>
    </Provider>
  );
}
```

## Accessing Router

Once provided, use hooks to access the router:

```tsx
import { useRouter } from '@argon-router/react';

function Navigation() {
  const router = useRouter();

  return (
    <button onClick={() => router.back()}>
      Go Back
    </button>
  );
}
```

## Multiple Routers

You can use multiple routers in different parts of your app:

```tsx
import { RouterProvider } from '@argon-router/react';

const mainRouter = createRouter({ routes: [homeRoute, aboutRoute] });
const adminRouter = createRouter({ routes: [dashboardRoute, usersRoute] });

function App() {
  return (
    <div>
      <RouterProvider router={mainRouter}>
        <MainApp />
      </RouterProvider>

      <RouterProvider router={adminRouter}>
        <AdminPanel />
      </RouterProvider>
    </div>
  );
}
```

## Error Handling

Components that use router hooks will throw an error if used outside RouterProvider:

```tsx
function Component() {
  // ❌ Error: Router not found. Add RouterProvider in app root
  const router = useRouter();
}
```

Always wrap your app with RouterProvider:

```tsx
// ✅ Correct
<RouterProvider router={router}>
  <Component />
</RouterProvider>
```

## Example: Complete Setup

```tsx
import { createRoot } from 'react-dom/client';
import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';
import { createBrowserHistory } from 'history';
import { RouterProvider } from '@argon-router/react';
import { historyAdapter } from '@argon-router/core';
import { router } from './router';
import { App } from './app';

const root = createRoot(document.getElementById('root')!);

async function render() {
  const scope = fork();
  const history = createBrowserHistory();

  // Initialize router with history
  await allSettled(router.setHistory, {
    scope,
    params: historyAdapter(history),
  });

  root.render(
    <Provider value={scope}>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </Provider>
  );
}

render();
```

## See Also

- [useRouter](./use-router) - Access router in components
- [createRouter](/core/create-router) - Create router instance
- [createRoutesView](./create-routes-view) - Render active routes

