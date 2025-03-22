# createRouter

Creates new router. Has required parameter `routes`

### Basic example

```ts
import { createRouter } from '@argon-router/core';
import { routes } from './routes';

const router = createRouter({
  routes: [routes.route1, routes.route2],
});
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

### Writing in query or path

in some cases you need to write custom query parameters or path, you can
make this easily with `navigate` event:

```ts
sample({
  clock: goToPage,
  fn: () => ({ path: '/page' }),
  target: router.navigate,
});

sample({
  clock: addQuery,
  fn: () => ({ query: { param1: 'hello', params2: [1, 2] } }),
  target: router.navigate,
});
```

also you can read values from this stores:

```ts
router.$query.map((query) => ...);
router.$path.map((path) => ...);
```

### Navigate to path

```ts
route.navigate({ query: { hello: 1 }, path: '/route', replace: true });
```

## API

| name       | type                             | description                                           |
| ---------- | -------------------------------- | ----------------------------------------------------- |
| $query     | Store\<Query\>                   | query parameters                                      |
| $path      | Store\<string\>                  | path                                                  |
| back       | EventCallable\<void\>            | go back (if possible)                                 |
| forward    | EventCallable\<void\>            | go forward (if possible)                              |
| navigate   | EventCallable\<NavigatePayload\> | navigate to path with query & replace or not          |
| setHistory | EventCallable\<History\>         | initialize router with history from `history` package |
| trackQuery |                                  | track query, [reference](./track-query.md)            |
