# createVirtualRoute

Creates new `virtual` route. Virtual routes used in chained routes and you can also use it for elements of your ui-kit such as `dialog`, `popup` and etc.

::: warning

By default `$params` has value which you passed in `open` event, buy you can change this behavior with `transformer` option.

:::

### Basic example

```ts
import { createVirtualRoute } from '@argon-router/core';

const route = createVirtualRoute();

route.open();
```

### Dialog

```ts
import { createVirtualRoute } from '@argon-router/core';

function createDialog<Params>() {
  const virtualRoute = createVirtualRoute<Params, Params>();

  return {
    $isOpened: virtualRoute.$isOpened,
    $params: virtualRoute.$params,
    open: virtualRoute.open,
    close: virtualRoute.close,
    opened: virtualRoute.opened,
    closed: virtualRoute.closed,
  };
}
```
