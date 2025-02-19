# createRoute

Creates new route. Has required parameter `path`

### Basic example

```ts
import { createRoute } from '@argon-router/core';

const route = createRoute({ path: '/route' });

route.open();
```

### In-route path params

You can specify params in route path and argon-router outputs type in route object generic by `typed-url-params` library. [Learn more about syntax](https://github.com/menduz/typed-url-params)

```ts
import { createRoute } from '@argon-router/core';

const postRoute = createRoute({ path: '/post/:id' });
//       ^- Route<{ id: string }>
```

## API

| name           | type                                     | description                                                  |
| -------------- | ---------------------------------------- | ------------------------------------------------------------ |
| $params        | Store\<T\>                               | route path parameters                                        |
| $isOpened      | Store\<boolean\>                         | is route opened (note: route opened if his child opened too) |
| $isPending     | Store\<boolean\>                         | is route open pending (if before open in progress)           |
| open           | EventCallable\<RouteOpenedPayload\<T\>\> | open route and it's parents                                  |
| openedOnServer | Event\<RouteOpenedPayload\<T\>\>         | route opened on server (SSR)                                 |
| openedOnClient | Event\<RouteOpenedPayload\<T\>\>         | route opened on client                                       |
| opened         | Event\<RouteOpenedPayload\<T\>\>         | route opened on server (SSR) or client                       |
| closed         | Event\<void\>                            | route closed                                                 |
