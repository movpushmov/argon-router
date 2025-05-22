import { CreateRouteViewProps, RouteView } from './types';

/**
 * @description Creates Route view without async bundle load
 * @link https://movpushmov.dev/argon-router/react/create-route-view.html
 * @param props Route view props
 * @returns RouteView
 * @example ```ts
 * import { createRouteView } from '@argon-router/react';
 * import { routes } from '@shared/routing';
 * import { MainLayout } from '@layouts';
 *
 * function Profile() {
 *   return <>...</>;
 * }
 *
 * export const ProfileScreen = createRouteView({
 *   route: routes.profile,
 *   view: Profile,
 *   layout: MainLayout,
 * });
 * ```
 */
export function createRouteView<T>(props: CreateRouteViewProps<T>): RouteView {
  return {
    route: props.route,
    view: () => {
      const { view: View, layout: Layout } = props;

      return Layout ? (
        <Layout>
          <View />
        </Layout>
      ) : (
        <View />
      );
    },
  };
}
