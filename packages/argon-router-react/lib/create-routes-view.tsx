import { ComponentType, createElement } from 'react';
import { useRouter } from './use-router';
import { Route } from '@argon-router/core';
import { InternalRoute } from '@argon-router/core/lib/types';
import { RouteView } from './types';

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
    const { activeRoutes } = useRouter();

    const filtered = activeRoutes.reduce<Route<any>[]>((acc, route) => {
      return acc.filter((r) => r !== (route as InternalRoute<any>).parent);
    }, activeRoutes);

    const displayedRoute = routes.find(
      (props) => props.route === filtered.at(-1),
    );

    if (!displayedRoute) {
      return NotFound ? <NotFound /> : null;
    }

    return createElement(displayedRoute.view);
  };
};
