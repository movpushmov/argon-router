import {
  createEvent,
  createStore,
  EventCallable,
  sample,
  Store,
} from 'effector';
import {
  NavigatePayload,
  Query,
  QueryTracker,
  QueryTrackerConfig,
  Route,
} from './types';
import type { z, ZodType } from 'zod';

function isForRouteActive(forRoutes: Route<any>[], activeRoutes: Route<any>[]) {
  for (const route of forRoutes) {
    if (activeRoutes.includes(route)) {
      return true;
    }
  }

  return false;
}

type FactoryPayload = {
  $activeRoutes: Store<Route<any>[]>;
  $query: Store<Query>;
  navigate: EventCallable<NavigatePayload>;
};

type ControlsFactory = <T extends ZodType>(
  config: Omit<QueryTrackerConfig<T>, 'forRoutes'>,
) => QueryTracker<T>;

export function trackQueryControlsFactory({
  $query,
  navigate,
}: Omit<FactoryPayload, '$activeRoutes'>): ControlsFactory {
  return trackQueryFactory({
    $activeRoutes: createStore([]),
    $query,
    navigate,
  });
}

export function trackQueryFactory({
  $activeRoutes,
  $query,
  navigate,
}: FactoryPayload) {
  return <T extends ZodType>(
    config: QueryTrackerConfig<T>,
  ): QueryTracker<T> => {
    const { parameters, forRoutes } = config;

    const $entered = createStore(false);

    const entered = createEvent<z.infer<T>>();
    const exited = createEvent();

    const enter = createEvent<z.infer<T>>();
    const exit = createEvent<{ ignoreParams: string[] } | void>();

    const changeEntered = createEvent<boolean>();

    sample({
      clock: changeEntered,
      target: $entered,
    });

    sample({
      source: { activeRoutes: $activeRoutes, query: $query },
      filter: ({ activeRoutes, query }) =>
        (!forRoutes || isForRouteActive(forRoutes, activeRoutes)) &&
        parameters.safeParse(query).success,
      fn: ({ query }) => parameters.safeParse(query).data,
      target: [entered, changeEntered.prepend(() => true)],
    });

    sample({
      source: { activeRoutes: $activeRoutes, query: $query, entered: $entered },
      filter: ({ activeRoutes, query, entered }) =>
        entered &&
        !(
          (!forRoutes || isForRouteActive(forRoutes, activeRoutes)) &&
          parameters.safeParse(query).success
        ),
      target: [
        exited.prepend(() => undefined),
        changeEntered.prepend(() => false),
      ],
    });

    sample({
      clock: enter,
      source: $query,
      fn: (query, payload) => {
        return { query: { ...query, ...payload } };
      },
      target: navigate,
    });

    sample({
      clock: exit,
      source: $query,
      fn: (query, payload) => {
        if (payload && payload.ignoreParams) {
          const copy: Query = {};

          for (const key of payload.ignoreParams) {
            if (query[key]) {
              copy[key] = query[key];
            }
          }

          return { query: copy };
        }

        return { query: {} };
      },
      target: navigate,
    });

    return {
      enter,
      entered,

      exited,
      exit,
    };
  };
}
