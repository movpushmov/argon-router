import { ComponentType, createElement, useMemo } from 'react';
import { RouteView } from './types';
import { useProvidedScope, useUnit } from 'effector-react';
import { Scope, Store } from 'effector';

interface CreateRoutesViewProps {
  routes: RouteView[];
  otherwise?: ComponentType;
}

function getStoreValue<T>(store: Store<T>, scope: Scope | null): T {
  return scope ? scope.getState(store) : store.getState();
}

/**
 * @description Create routes view which renders current opened route. `Don't forget add <RouterProvider>`!
 * @param props Routes view config
 * @link https://movpushmov.dev/argon-router/react/create-routes-view.html
 * @returns RoutesView
 * @example ```tsx
 * import { createRoutesView } from '@argon-router/react';
 * import { router } from './router';
 * // feed screen & profile screen must be created with createRouteView!
 * import { FeedScreen, ProfileScreen } from './screens';
 *
 * const RoutesView = createRoutesView({ routes: [FeedScreen, ProfileScreen] });
 *
 * // then you can use it like react component:
 * function App() {
 *   return (
 *     <RouterProvider router={router}>
 *       <RoutesView />
 *     </RouterProvider>
 *   );
 * }
 * ```
 */
export const createRoutesView = (props: CreateRoutesViewProps) => {
  const { routes, otherwise: NotFound } = props;

  return () => {
    const scope = useProvidedScope();
    const displayedRoutes = useMemo(
      () =>
        routes.reduce<RouteView[]>((displayedRoutes, routeView) => {
          if (getStoreValue(routeView.route.$isOpened, scope)) {
            displayedRoutes.push(routeView);
          }

          return displayedRoutes;
        }, []),
      [scope, useUnit(routes.map(({ route }) => route.$isOpened))],
    );

    const lastRoute = displayedRoutes.at(-1);

    if (!lastRoute) {
      return NotFound ? <NotFound /> : null;
    }

    return createElement(lastRoute.view);
  };
};
