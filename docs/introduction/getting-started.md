---
title: Getting started
---

# Getting started

## Installation

::: warning
argon-router is not production ready yet and still may have bugs and unstable API.
If you found bug — please report it on GitHub.
:::

::: code-group

```bash [npm]
npm install @argon-router/core history
```

```bash [yarn]
yarn add @argon-router/core history
```

```bash [pnpm]
pnpm add @argon-router/core history
```

:::

::: tip
In SSR project you must add @argon-router/core in "factories"
list in [effector babel plugin](https://effector.dev/en/api/effector/babel-plugin/#configuration-factories)
:::

## React bindings

::: code-group

```bash [npm]
npm install @argon-router/react
```

```bash [yarn]
yarn add @argon-router/react
```

```bash [pnpm]
pnpm add @argon-router/react
```

:::

## Writing first router

As an example, we will write a simple router with `feed` and `profile` routes.

```ts
import { createRoute, createRouter } from '@argon-router/core';
import { fork } from 'effector';

const scope = fork();

const routes = {
  feed: createRoute({ path: '/' }),
  profile: createRoute({ path: '/profile' }),
};

const router = createRouter({
  routes: [routes.feed, routes.profile],
});
```

```tsx
// profile.tsx
import { createRouteView } from '@argon-router/react';

const Profile = () => {
  return <>...</>;
};

export const ProfileScreen = createRouteView({
  route: routes.profile,
  view: Profile,
});
```

```tsx
// feed.tsx
import { createRouteView } from '@argon-router/react';

const Feed = () => {
  return <>...</>;
};

export const FeedScreen = createRouteView({ route: routes.feed, view: Feed });
```

```tsx
// app.tsx
import { createRoutesView } from '@argon-router/react';
import { FeedScreen, ProfileScreen } from './screens';
import { router } from './shared/routing';

const RoutesView = createRoutesView({ routes: [FeedScreen, ProfileScreen] });

export function App() {
  return (
    <RouterProvider router={router}>
      <RoutesView />
    </RouterProvider>
  );
}
```

::: warning

router need to be initialzed with `setHistory` event, which requires memory or browser history from `history` package.

```ts
import { createRoot } from 'react-dom/client';
import { allSettled, fork } from 'effector';
import { createBrowserHistory } from 'history';
import { Provider } from 'effector-react';
import { router } from './shared/routing';
import { App } from './app';

const root = createRoot(document.getElementById('root')!);

async function render() {
  const scope = fork();

  await allSettled(router.setHistory, {
    scope,
    params: createBrowserHistory(),
  });

  root.render(
    <Provider value={scope}>
      <App />
    </Provider>,
  );
}

render();
```

:::
