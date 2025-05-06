# createRouterControls

Creates router controls

### Basic example

```ts
import { createRouterControls } from '@argon-router/core';

const controls = createRouterControls();
```

::: warning

router controls need to be initialzed with `setHistory` event, which requires memory or browser history from `history` package.

```ts
import { createRouterControls } from '@argon-router/core';

const controls = createRouterControls();
const scope = fork();

await allSettled(controls.setHistory, {
  scope,
  params: createBrowserHistory(),
});
```

:::

### Writing in query or path

in some cases you need to write custom query parameters or path, you can
make this easily with `navigate` event:

```ts
sample({
  clock: goToPage,
  fn: () => ({ path: '/page' }),
  target: controls.navigate,
});

sample({
  clock: addQuery,
  fn: () => ({ query: { param1: 'hello', params2: [1, 2] } }),
  target: controls.navigate,
});
```

also you can read values from this stores:

```ts
controls.$query.map((query) => ...);
controls.$path.map((path) => ...);
```

### Navigate to path

```ts
controls.navigate({ query: { hello: 1 }, path: '/route', replace: true });
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
