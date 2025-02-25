import { CreateRouteViewProps, RouteView } from './types';

export const createRouteView = (props: CreateRouteViewProps): RouteView => {
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
};
