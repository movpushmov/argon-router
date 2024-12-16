import { ComponentType } from 'react';
import { CreateRouteViewProps } from './create-route-view';
import { useUnit } from 'effector-react';

interface CreateRoutesViewProps {
  routes: CreateRouteViewProps[];
  otherwise?: ComponentType;
}

export const createRoutesView = (props: CreateRoutesViewProps) => {
  const { routes, otherwise: NotFound } = props;

  return () => {
    const routesInfo = routes.map(({ route, view, layout }) => {
      const { isOpened } = useUnit(route);

      return {
        view,
        layout,
        isOpened,
      };
    });

    for (const info of routesInfo) {
      if (!info.isOpened) {
        continue;
      }

      const { view: View, layout: Layout } = info;

      return Layout ? (
        <Layout>
          <View />
        </Layout>
      ) : (
        <View />
      );
    }

    return NotFound ? <NotFound /> : null;
  };
};
