# createRoute

Creates new route. Has required parameter `path`

### Basic example

```ts
import { createRoute } from '@argon-router/core';

const route = createRoute({ path: '/route' });

route.open();
```

### In-route path params

Argon-router uses its own tool for parsing and building paths, while validating parameters for compliance with the specified type and other passed parameters constraints at runtime.

By default, each parameter is treated as a string:
```ts
import { createRoute } from '@argon-router/core';

const postRoute = createRoute({ path: '/post/:id' });
//       ^- Route<{ id: string }>
```

However, you can also explicitly specify that a parameter should be of type `number` or `union`:
```ts
import { createRoute } from '@argon-router/core';

const postRoute = createRoute({ path: '/post/:id<number>' });
//       ^- Route<{ id: number }>

const buildPostRoute = createRoute({ path: '/build-post/:mode<create|update>' });
//       ^- Route<{ mode: 'create' | 'update' }>
```

You can also specify a number of modifiers for each parameter. More details about the syntax can be found [here](https://github.com/movpushmov/argon-router/tree/main/packages/argon-router-paths#supported-types).

### Parent paths

Sometimes you want to nest `path` parts and `beforeOpen` effects from some routes. You can do this easily with `parent` routes:

```ts
import { createRoute } from '@argon-router/core';

const profile = createRoute({ path: '/profile/:id', beforeOpen: [] });

const friends = createRoute({ path: '/friends', parent: profile });
const posts = createRoute({ path: '/posts', parent: profile });

posts.open(); // profile.$isOpened -> true, posts.$isOpened -> true
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
| path           | string                                   | route path                                                   |
| parent         | Route\<any\>                             | parent path                                                  |
| beforeOpen     | Effect\<any, any\>\[\]                   | before open effects                                          |
