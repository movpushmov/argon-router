import { lazy, Suspense } from 'react';
import { CreateLazyRouteViewProps, RouteView } from './types';
import { InternalRoute } from '@argon-router/core/lib/types';

export const createLazyRouteView = (
  props: CreateLazyRouteViewProps,
): RouteView => {
  (props.route as InternalRoute<any>).internal.setAsyncImport(props.view);
  const View = lazy(props.view);

  return {
    route: props.route,
    view: () => {
      const { layout: Layout, fallback: Fallback = () => <></> } = props;

      return Layout ? (
        <Layout>
          <Suspense fallback={<Fallback />}>
            <View />
          </Suspense>
        </Layout>
      ) : (
        <Suspense fallback={<Fallback />}>
          <View />
        </Suspense>
      );
    },
  };
};
