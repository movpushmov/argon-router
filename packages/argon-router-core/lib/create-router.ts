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
  routes: Route<any>[];
}

function fromLocation(location: { pathname: string; search: string }) {
  const queryParams = new URLSearchParams(location.search);

  return {
    path: location.pathname,
    query: [...queryParams.keys()].reduce<Query>((acc, parameter) => {
      if (acc[parameter]) {
        acc[parameter] = queryParams.getAll(parameter);
      } else {
        acc[parameter] = queryParams.get(parameter)!;
      }

      return acc;
    }, {}),
  };
}

export function createRouter(config: RouterConfig): Router {
  const { base = '/', routes } = config;

  const $history = createStore<History | null>(null, { serialize: 'ignore' });
  const $activeRoutes = createStore<Route<any>[]>([], { serialize: 'ignore' });

  const $query = createStore<Query>({});
  const $path = createStore<string>(null as unknown as string);

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

      if (internalRoute.internal.path !== '/') {
        path.unshift(internalRoute.internal.path);
      }
    }

    const joinedPath = base === '/' ? path.join('') : [base, ...path].join('');

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
        history.push(payload.pathname);
      }
    },
  });

  for (const { route, toPath } of mappedRoutes) {
    sample({
      clock: route.opened,
      source: $activeRoutes,
      filter: (routes) => !routes.includes(route),
      fn: (routes) => [...routes, route],
      target: $activeRoutes,
    });

    sample({
      clock: route.opened,
      filter: (payload: any) => !payload.historyIgnore,
      fn: ({ params, query, replace } = { params: {} }) => ({
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
          route.internal.close();
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
    clock: $history,
    filter: Boolean,
    fn: (history) => fromLocation(history.location),
    target: spread({
      targets: {
        path: $path,
        query: $query,
      },
    }),
  });

  sample({
    clock: [locationUpdated],
    fn: (location) => fromLocation(location),
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
