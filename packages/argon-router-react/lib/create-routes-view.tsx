import { ComponentType, createElement } from 'react';
import { useRouter } from './use-router';
import { Route } from '@argon-router/core';
import { InternalRoute } from '@argon-router/core/lib/types';
import { RouteView } from './types';

interface CreateRoutesViewProps {
  routes: RouteView[];
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

    return createElement(displayedRoute.view);
  };
};
