# createRoute

Creates new route. Has required parameter `path`

### Basic example

```ts
import { createRoute } from '@argon-router/core';

const route = createRoute({ path: '/route' });

route.open();
```

### In-route path params

You can specify params in route path and argon-router outputs type in route object generic by `typed-url-params` library. [Learn more about syntax](https://github.com/movpushmov/argon-router/tree/main/packages/argon-router-paths)

```ts
import { createRoute } from '@argon-router/core';

const postRoute = createRoute({ path: '/post/:id' });
//       ^- Route<{ id: string }>
```

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
