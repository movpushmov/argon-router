import { ComponentType, createElement, useMemo } from 'react';
import { RouteView } from './types';
import { useUnit } from 'effector-react';
import { InternalRoute } from '@argon-router/core/lib/types';

interface CreateRoutesViewProps {
  routes: RouteView[];
  otherwise?: ComponentType;
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
    const visibilities = useUnit(routes.map((view) => view.route.$isOpened));

    const openedViews = useMemo(() => {
      const filtered = routes.filter((_, i) => visibilities[i]);

      return filtered.reduce(
        (filtered, view) =>
          filtered.filter(
            (r) => r.route !== (view.route as InternalRoute<any>).parent,
          ),
        filtered,
      );
    }, [visibilities]);

    const lastRoute = openedViews.at(-1);

    if (!lastRoute) {
      return NotFound ? <NotFound /> : null;
    }

    return createElement(lastRoute.view);
  };
};
