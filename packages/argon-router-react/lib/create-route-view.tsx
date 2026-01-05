import type { CreateRouteViewProps, RouteView } from './types';

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
export function createRouteView<T extends object | void = void>(
  props: CreateRouteViewProps<T>,
): RouteView {
  const { layout: Layout, view: View } = props;

  const view = Layout
    ? () => (
        <Layout>
          <View />
        </Layout>
      )
    : () => <View />;

  return {
    route: props.route,
    view,
  };
}
