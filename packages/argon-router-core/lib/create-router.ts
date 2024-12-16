import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  scopeBind,
} from 'effector';
import { InternalRoute, Query, Route, Router } from './types';
import { compile, match } from 'path-to-regexp';
import { trackQueryFactory } from './track-query';

import type { History } from 'history';
import { spread } from 'patronum';

interface RouterConfig {
  base?: string;
  history?: History;
  routes: Route<any>[];
}

export function createRouter(config: RouterConfig): Router {
  const { base = '/', history, routes } = config;

  const $query = createStore<Query>({});
  const $history = createStore(history ?? null);
  const $path = createStore<string>('/');
  const $activeRoutes = createStore<Route<any>[]>([]);

  const setHistory = createEvent<History>();

  const back = createEvent();
  const forward = createEvent();

  const locationUpdated = createEvent<{ pathname: string; search: string }>();

  const mappedRoutes = routes.map((route) => {
    let internalRoute = route as InternalRoute<any>;
    const path: string[] = [];

    path.unshift(internalRoute.internal.path);

    while (internalRoute.internal.parent) {
      internalRoute = internalRoute.internal.parent;
      path.unshift(internalRoute.internal.path);
    }

    const joinedPath = (base === '/' ? path : [base, ...path]).join('');

    return {
      route: route as InternalRoute<any>,
      path: joinedPath,
      toPath: compile(joinedPath),
      fromPath: match(joinedPath),
    };
  });

  const updateHistoryFx = attach({
    source: { history: $history },
    effect: async (
      { history },
      {
        path,
        query,
        replace,
      }: {
        path: string;
        query: Query;
        replace?: boolean;
      },
    ) => {
      if (!history) {
        throw new Error('history not found');
      }

      const payload = { pathname: path, query };

      if (replace) {
        history.replace(payload);
      } else {
        history.push(payload);
      }
    },
  });

  for (const { route, toPath } of mappedRoutes) {
    sample({
      clock: route.opened,
      source: $activeRoutes,
      fn: (routes) => [...routes, route],
      target: $activeRoutes,
    });

    sample({
      clock: route.opened,
      fn: ({ params, query, replace }) => ({
        path: toPath(params),
        query: query ?? {},
        replace,
      }),
      target: updateHistoryFx,
    });

    sample({
      clock: route.closed,
      source: $activeRoutes,
      fn: (routes) => routes.filter((r) => r !== route),
      target: $activeRoutes,
    });
  }

  sample({
    clock: setHistory,
    target: $history,
  });

  const subscribeHistoryFx = createEffect((history: History) => {
    const historyLocationUpdated = scopeBind(locationUpdated);

    if (!history) {
      throw new Error();
    }

    history.listen(({ location }) => {
      historyLocationUpdated(location);
    });
  });

  const openRoutesByPathFx = attach({
    source: { query: $query, path: $path },
    effect: async ({ query, path }) => {
      for (const { route, fromPath } of mappedRoutes) {
        const matchResult = fromPath(path);

        if (!matchResult) {
          continue;
        } else {
          await route.internal.openFx({ query, params: matchResult.params });
        }
      }
    },
  });

  sample({
    clock: $history,
    filter: Boolean,
    target: subscribeHistoryFx,
  });

  sample({
    clock: locationUpdated,
    fn: ({ pathname, search }) => {
      const queryParams = new URLSearchParams(search);

      return {
        path: pathname,
        query: [...queryParams.keys()].reduce<Query>((acc, parameter) => {
          if (acc[parameter]) {
            acc[parameter] = queryParams.getAll(parameter);
          } else {
            acc[parameter] = queryParams.get(parameter)!;
          }

          return acc;
        }, {}),
      };
    },
    target: spread({
      targets: {
        path: $path,
        query: $query,
      },
    }),
  });

  sample({
    clock: $path,
    target: openRoutesByPathFx,
  });

  return {
    $query,
    $path,

    $activeRoutes,

    back,
    forward,

    routes,
    setHistory,

    mappedRoutes,

    trackQuery: trackQueryFactory($activeRoutes, $query),

    '@@unitShape': () => ({
      query: $query,
      path: $path,
      activeRoutes: $activeRoutes,

      onBack: back,
      onForward: forward,
    }),
  };
}
