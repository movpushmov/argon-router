import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  scopeBind,
} from 'effector';
import { InternalRoute, NavigatePayload, Query, Route, Router } from './types';
import { compile, match } from 'path-to-regexp';
import { trackQueryFactory } from './track-query';

import type { History } from 'history';
import { spread } from 'patronum';

import queryString from 'query-string';

interface RouterConfig {
  base?: string;
  routes: Route<any>[];
}

/**
 * @description Creates argon router
 * @param config Router config
 * @returns `Router`
 * @link https://movpushmov.dev/argon-router/core/create-router.html
 *
 * `be careful! router need to be initialzed with setHistory event,
 * which requires memory or browser history from history package.`
 *
 * @example ```ts
 * import { createRouter } from '@argon-router/core';
 * import { routes } from './routes';
 *
 * // create router
 * const router = createRouter({
 *   routes: [routes.route1, routes.route2],
 * });
 *
 * // override path or query
 * sample({
 *  clock: goToPage,
 *  fn: () => ({ path: '/page' }),
 *  target: router.navigate,
 * });
 *
 * sample({
 *  clock: addQuery,
 *  fn: () => ({ query: { param1: 'hello', params2: [1, 2] } }),
 *  target: router.navigate,
 * });
 *
 * ```
 */
export function createRouter(config: RouterConfig): Router {
  const { base = '/', routes } = config;

  const $history = createStore<History | null>(null, { serialize: 'ignore' });

  const $query = createStore<Query>({});
  const $path = createStore<string>(null as unknown as string);

  const setHistory = createEvent<History>();
  const navigate = createEvent<NavigatePayload>();

  const back = createEvent();
  const forward = createEvent();

  const locationUpdated = createEvent<{
    pathname: string;
    query: Query;
  }>();

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

  const $activeRoutes = $path.map((path) => {
    const result: Route<any>[] = [];

    for (const { route, fromPath } of mappedRoutes) {
      if (fromPath(path)) {
        result.push(route);
      }
    }

    return result;
  });

  const navigateFx = attach({
    source: $history,
    effect: (history, { path, query, replace }: NavigatePayload) => {
      if (!history) {
        throw new Error('history not found');
      }

      const payload = {
        pathname: path,
        search: `?${queryString.stringify(query)}`,
      };

      if (replace) {
        history.replace(payload);
      } else {
        history.push(payload);
      }
    },
  });

  const subscribeHistoryFx = createEffect((history: History) => {
    const historyLocationUpdated = scopeBind(locationUpdated);

    historyLocationUpdated({
      pathname: history.location.pathname,
      query: { ...queryString.parse(history.location.search) },
    });

    if (!history) {
      throw new Error();
    }

    history.listen(({ location }) => {
      historyLocationUpdated({
        pathname: location.pathname,
        query: { ...queryString.parse(location.search) },
      });
    });
  });

  const openRoutesByPathFx = attach({
    source: { query: $query, path: $path },
    effect: async ({ query, path }) => {
      for (const { route, fromPath } of mappedRoutes) {
        const matchResult = fromPath(path);
        const [routeClosed, routeNavigated] = [
          scopeBind(route.internal.close),
          scopeBind(route.internal.navigated),
        ];

        if (!matchResult) {
          routeClosed();
        } else {
          routeNavigated({
            query,
            params: matchResult.params,
          });
        }
      }
    },
  });

  for (const { route, toPath } of mappedRoutes) {
    sample({
      clock: route.internal.openFx.doneData,
      filter: (payload) => payload?.navigate !== false,
      fn: (payload): NavigatePayload => {
        return {
          path: toPath(
            payload && 'params' in payload ? payload.params : undefined,
          ),
          query: payload?.query ?? {},
          replace: payload?.replace,
        };
      },
      target: navigate,
    });
  }

  sample({
    clock: setHistory,
    target: $history,
  });

  sample({
    clock: $history,
    filter: Boolean,
    target: subscribeHistoryFx,
  });

  sample({
    clock: locationUpdated,
    fn: (location) => ({
      path: location.pathname,
      query: location.query,
    }),
    target: spread({
      targets: {
        path: $path,
        query: $query,
      },
    }),
  });

  sample({
    clock: locationUpdated,
    fn: (location) => ({
      path: location.pathname,
      query: location.query,
    }),
    target: openRoutesByPathFx,
  });

  sample({
    clock: navigate,
    source: $path,
    fn: (path, payload) => ({ path, ...payload }),
    target: navigateFx,
  });

  return {
    $query,
    $path,

    $activeRoutes,

    back,
    forward,

    navigate,

    routes,
    setHistory,

    mappedRoutes,

    trackQuery: trackQueryFactory({ $activeRoutes, $query, navigate }),

    '@@unitShape': () => ({
      query: $query,
      path: $path,
      activeRoutes: $activeRoutes,

      onBack: back,
      onForward: forward,
      onNavigate: navigate,
    }),
  };
}
