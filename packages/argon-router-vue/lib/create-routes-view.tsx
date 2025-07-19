import { useUnit } from 'effector-vue/composition';
import { RouteView } from './types';
import { Component, computed, defineComponent, h } from 'vue';

interface CreateRoutesViewProps {
  routes: RouteView[];
  otherwise?: Component;
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
  return defineComponent({
    setup() {
      console.log(props);

      const visibilities = useUnit(
        props.routes.map((view) => view.route.$isOpened),
      );

      const openedViews = computed(() => {
        const filtered = props.routes.filter(
          (view) => visibilities[props.routes.indexOf(view)],
        );

        return filtered.reduce(
          (result, view) => result.filter((r) => r.route !== view.route.parent),
          filtered,
        );
      });

      const lastRoute = computed(() => openedViews.value.at(-1));

      if (!lastRoute.value) {
        const { otherwise } = props;

        return otherwise ? () => h(otherwise) : null;
      }

      const { view } = lastRoute.value;

      console.log(view);

      return () => h(view);
    },
  });
};
