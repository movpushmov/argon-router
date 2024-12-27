import { Route } from '@argon-router/core';
import { useUnit } from 'effector-react';
import { ComponentType, ReactNode } from 'react';

export interface CreateRouteViewProps {
  route: Route<any>;
  view: ComponentType;
  layout?: ComponentType<{ children?: ReactNode }>;
}

export const createRouteView = (props: CreateRouteViewProps) => {
  return {
    ...props,
    view: () => {
      const { view: View, layout: Layout, route } = props;

      const { isOpened } = useUnit(route);

      if (isOpened) {
        return Layout ? (
          <Layout>
            <View />
          </Layout>
        ) : (
          <View />
        );
      }

      return null;
    },
  };
};
