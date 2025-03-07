import { attach, createEvent, createStore, sample, scopeBind } from 'effector';
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

type LocationState = { skipUpdate?: boolean };
type Meta = { skipUpdate: boolean };

export function createRouter(config: RouterConfig): Router {
  const { base = '/', routes } = config;

  const $meta = createStore<Meta>({ skipUpdate: false });

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
    state: LocationState;
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
    source: { history: $history, meta: $meta },
    effect: async (
      { history, meta },
      { path, query, replace }: NavigatePayload,
    ) => {
      if (!history) {
        throw new Error('history not found');
      }

      if (meta.skipUpdate) {
        meta.skipUpdate = false;

        return;
      }

      const payload = {
        pathname: path,
        search: `?${queryString.stringify(query)}`,
      };

      if (replace) {
        history.replace(payload);
      } else {
        history.push(payload, { skipUpdate: true } satisfies LocationState);
      }
    },
  });

  const subscribeHistoryFx = attach({
    source: $meta,
    effect: (meta, history: History) => {
      const historyLocationUpdated = scopeBind(locationUpdated);

      historyLocationUpdated({
        pathname: history.location.pathname,
        query: { ...queryString.parse(history.location.search) },
        state: (history.location.state ?? {}) as LocationState,
      });

      if (!history) {
        throw new Error();
      }

      history.listen(({ location }) => {
        const state = (location.state ?? {}) as LocationState;

        if (state.skipUpdate) {
          meta.skipUpdate = true;
        }

        historyLocationUpdated({
          pathname: location.pathname,
          query: { ...queryString.parse(location.search) },
          state,
        });
      });
    },
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
          await route.internal.openFx({
            query,
            params: matchResult.params,
            historyIgnore: true,
          });
        }
      }
    },
  });

  for (const { route, toPath } of mappedRoutes) {
    sample({
      clock: route.opened,
      filter: (payload: any) => !payload?.historyIgnore,
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
    target: navigateFx,
  });

  sample({
    clock: [$query, $path],
    source: { query: $query, path: $path },
    fn: (payload) => payload,
    target: navigate,
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

    trackQuery: trackQueryFactory({ $activeRoutes, $path, $query, navigateFx }),

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
