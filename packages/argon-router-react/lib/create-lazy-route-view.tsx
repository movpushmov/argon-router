import { Route } from '@argon-router/core';
import { InternalRoute } from '@argon-router/core/lib/types';
import { useUnit } from 'effector-react';
import { ComponentType, lazy, ReactNode, Suspense } from 'react';

type LazyComponent = () => Promise<{ default: ComponentType }>;

export interface CreateRouteViewProps {
  route: Route<any>;
  view: LazyComponent;
  fallback?: ComponentType;
  layout?: ComponentType<{ children?: ReactNode }>;
}

export const createLazyRouteView = (props: CreateRouteViewProps) => {
  (props.route as InternalRoute<any>).internal.setAsyncImport(props.view);
  const View = lazy(props.view);

  return {
    ...props,
    view: () => {
      const { layout: Layout, fallback: Fallback = () => <></>, route } = props;

      const { isOpened } = useUnit(route);

      if (isOpened) {
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
      }

      return null;
    },
  };
};
