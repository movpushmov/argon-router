import { type ComponentType, createElement } from 'react';
import { OutletContext } from './context';
import { useOpenedViews } from './use-opened-views';
import type { RouteView } from './types';

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
    const openedView = useOpenedViews(routes).at(-1);

    if (!openedView) {
      return NotFound ? <NotFound /> : null;
    }

    return (
      <OutletContext.Provider value={{ children: openedView.children ?? [] }}>
        {createElement(openedView.view)}
      </OutletContext.Provider>
    );
  };
};
