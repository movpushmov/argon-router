import { lazy, Suspense } from 'react';
import { CreateLazyRouteViewProps, RouteView } from './types';
import { InternalRoute } from '@argon-router/core/lib/types';

/**
 * @description Creates Lazy route view with async bundle load
 * @link https://movpushmov.dev/argon-router/react/create-lazy-route-view.html
 * @param props Lazy route view props
 * @returns RouteView
 * @example ```ts
 * // profile.tsx
 * export default function () {
 *   return <>...</>;
 * }
 *
 * // index.ts
 * import { createLazyRouteView } from '@argon-router/react';
 * import { routes } from '@shared/routing';
 * import { MainLayout } from '@layouts';
 *
 * export const ProfileScreen = createLazyRouteView({
 *   route: routes.profile,
 *   view: () => import('./profile'),
 *   fallback: () => ':(',
 *   layout: MainLayout,
 * });
 * ```
 */
export function createLazyRouteView<T>(
  props: CreateLazyRouteViewProps<T>,
): RouteView {
  (props.route as InternalRoute<T>).internal.setAsyncImport(props.view);
  const View = lazy(props.view);
  const { layout: Layout, fallback: Fallback = () => <></> } = props;

  const view = Layout
    ? () => (
        <Layout>
          <Suspense fallback={<Fallback />}>
            <View />
          </Suspense>
        </Layout>
      )
    : () => (
        <Suspense fallback={<Fallback />}>
          <View />
        </Suspense>
      );

  return {
    route: props.route,
    view,
  };
}
