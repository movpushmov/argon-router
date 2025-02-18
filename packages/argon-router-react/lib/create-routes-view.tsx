import { ComponentType } from 'react';
import { CreateRouteViewProps } from './create-route-view';
import { useRouter } from './use-router';
import { Route } from '@argon-router/core';
import { InternalRoute } from '@argon-router/core/lib/types';

interface CreateRoutesViewProps {
  routes: CreateRouteViewProps[];
  otherwise?: ComponentType;
}

export const createRoutesView = (props: CreateRoutesViewProps) => {
  const { routes, otherwise: NotFound } = props;

  return () => {
    const { activeRoutes } = useRouter();

    const filtered = activeRoutes.reduce<Route<any>[]>((acc, route) => {
      return acc.filter(
        (r) => r !== (route as InternalRoute<any>).internal.parent,
      );
    }, activeRoutes);

    const displayedRoute = routes.find(
      (props) => props.route === filtered.at(-1),
    );

    if (!displayedRoute) {
      return NotFound ? <NotFound /> : null;
    }

    const { view: View, layout: Layout } = displayedRoute;

    return Layout ? (
      <Layout>
        <View />
      </Layout>
    ) : (
      <View />
    );
  };
};
