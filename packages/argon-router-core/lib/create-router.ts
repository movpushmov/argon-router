import { attach, createEvent, sample, scopeBind } from 'effector';
import type {
  InternalPathlessRoute,
  InternalPathRoute,
  InternalRoute,
  InternalRouter,
  MappedRoute,
  PathlessRoute,
  PathRoute,
  Route,
  Router,
  RouterControls,
} from './types';
import { trackQueryFactory } from './track-query';

import { compile } from '@argon-router/paths';
import { createRouterControls } from './create-router-controls';
import { createAction } from 'effector-action';
import { is } from './utils';

type InputRoute =
  | PathRoute<any>
  | { path: string; route: PathlessRoute<any> }
  | Router;

interface RouterConfig {
  base?: string;
  routes: InputRoute[];
  controls?: RouterControls;
}

const inputIs = {
  pathlessRoute(
    route: InputRoute,
  ): route is { path: string; route: PathlessRoute<any> } {
    return 'route' in route;
  },

  pathRoute(route: InputRoute): route is PathRoute<any> {
    return !this.pathlessRoute(route) && !this.router(route);
  },

  router(route: InputRoute): route is Router {
    return is.router(route);
  },
};

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
  const {
    $path,
    $query,
    $history,
    back,
    forward,
    navigate,
    setHistory,
    locationUpdated,
  } = config.controls ?? createRouterControls();

  function getPathWithBase(path: string) {
    if (base === '/') {
      return path;
    }

    return path === '/' ? base : `${base}${path}`;
  }

  const connectToParentRouter = createEvent<Router>();

  let parent: Router | null = null;

  const knownRoutes: MappedRoute[] = [];

  function mapRoute(inputRoute: InputRoute): MappedRoute | null {
    if (inputIs.pathlessRoute(inputRoute)) {
      const { build, parse } = compile<string, any>(
        getPathWithBase(inputRoute.path),
      );

      const route = {
        route: inputRoute.route as InternalPathlessRoute<any>,
        path: inputRoute.path,
        build,
        parse,
      };

      return route;
    }

    if (inputIs.router(inputRoute)) {
      sample({
        clock: setHistory,
        target: inputRoute.setHistory,
      });

      return null;
    }

    let internalRoute = inputRoute as InternalPathRoute<any>;
    const path: string[] = [];

    path.unshift(internalRoute.path);

    while (internalRoute.parent) {
      if (is.pathlessRoute(internalRoute.parent)) {
        break;
      }

      internalRoute = internalRoute.parent as InternalPathRoute<any>;

      if (internalRoute.path !== '/') {
        path.unshift(internalRoute.path);
      }
    }

    const joinedPath = getPathWithBase(path.join(''));

    const { build, parse } = compile<string, any>(joinedPath);

    const route = {
      route: inputRoute as InternalRoute<any>,
      path: joinedPath,
      build,
      parse,
    };

    return route;
  }

  const ownRoutes = routes.reduce<MappedRoute[]>((acc, inputRoute) => {
    const mappedRoute = mapRoute(inputRoute);

    if (mappedRoute) {
      knownRoutes.push(mappedRoute);
      acc.push(mappedRoute);
    }

    if (inputIs.router(inputRoute)) {
      knownRoutes.push(...inputRoute.knownRoutes);
    }

    return acc;
  }, []);

  const $activeRoutes = $path.map((path) => {
    const result: Route<any>[] = [];

    if (!path) {
      return result;
    }

    for (const { route, parse } of ownRoutes) {
      if (parse(path)) {
        result.push(route);
      }
    }

    return result;
  });

  const openRoutesByPathFx = attach({
    source: { query: $query, path: $path },
    effect: async ({ query, path }) => {
      for (const { route, parse } of ownRoutes) {
        const matchResult = parse(path);
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

  function registerRouteApi({ route, build }: MappedRoute) {
    createAction({
      clock: route.internal.openFx.doneData,
      target: { navigate },
      fn: (target, payload) => {
        if (payload?.navigate === false) {
          return;
        }

        const navigateParams = {
          path: build(
            payload && 'params' in payload ? payload.params : undefined,
          ),
          query: payload?.query ?? {},
          replace: payload?.replace,
        };

        return target.navigate(navigateParams);
      },
    });
  }

  for (const route of ownRoutes) {
    registerRouteApi(route);
  }

  sample({
    clock: locationUpdated,
    fn: (location) => ({
      path: location.pathname,
      query: location.query,
    }),
    target: openRoutesByPathFx,
  });

  const router = {
    '@@type': 'router',

    $query,
    $path,
    $history,

    $activeRoutes,

    back,
    forward,

    navigate,

    setHistory,
    ownRoutes,
    knownRoutes,

    internal: {
      connectToParentRouter,

      get parent() {
        return parent;
      },

      set parent(router: Router | null) {
        parent = router;
      },

      base,
    },

    trackQuery: trackQueryFactory({ $activeRoutes, $query, navigate }),

    registerRoute: (route: InputRoute) => {
      const mappedRoute = mapRoute(route);

      if (mappedRoute) {
        knownRoutes.push(mappedRoute);
        ownRoutes.push(mappedRoute);

        registerRouteApi(mappedRoute);
      }

      if (inputIs.router(route)) {
        knownRoutes.push(...route.knownRoutes);
      }
    },

    '@@unitShape': () => ({
      query: $query,
      path: $path,
      activeRoutes: $activeRoutes,

      onBack: back,
      onForward: forward,
      onNavigate: navigate,
    }),
  } as InternalRouter;

  return router;
}
