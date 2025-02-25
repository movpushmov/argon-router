import { createEvent, createStore, Effect, sample, Store } from 'effector';
import {
  NavigatePayload,
  Query,
  QueryTracker,
  QueryTrackerConfig,
  RawConfig,
  ReadyConfig,
  Route,
} from './types';
import { parameters } from './const';

function isForRouteActive(forRoutes: Route<any>[], activeRoutes: Route<any>[]) {
  for (const route of forRoutes) {
    if (activeRoutes.includes(route)) {
      return true;
    }
  }

  return false;
}

function isHaveValidParams(query: Query, neededParameters: RawConfig) {
  for (const key in neededParameters) {
    const parameterType = neededParameters[key];

    if (
      Array.isArray(parameterType) &&
      (!query[key] || JSON.stringify(parameterType) !== query[key])
    ) {
      return false;
    }

    switch (typeof parameterType) {
      case 'number': {
        if (!query[key] || parameterType.toString() !== query[key]) {
          return false;
        }
        break;
      }
      case 'object': {
        if (!query[key] || JSON.stringify(parameterType) !== query[key]) {
          return false;
        }
        break;
      }
      case 'string': {
        if (!query[key] || parameterType !== query[key]) {
          return false;
        }
        break;
      }
      case 'boolean': {
        if (
          !query[key] ||
          !['0', '1', 'false', 'true'].includes(query[key] as string)
        ) {
          return false;
        }
        break;
      }
    }

    switch (parameterType) {
      case parameters.any: {
        if (!query[key]) {
          return false;
        }

        break;
      }
      case parameters.string: {
        if (!query[key] || Array.isArray(query[key])) {
          return false;
        }

        break;
      }
      case parameters.array: {
        if (!query[key] || !Array.isArray(query[key])) {
          return false;
        }

        break;
      }
      case parameters.number: {
        if (
          !query[key] ||
          Array.isArray(query[key]) ||
          (isNaN(parseInt(query[key])) && isNaN(parseFloat(query[key])))
        ) {
          return false;
        }
        break;
      }
      case parameters.boolean: {
        if (
          !query[key] ||
          Array.isArray(query[key]) ||
          !['0', '1', 'false', 'true'].includes(query[key] as string)
        ) {
          return false;
        }
        break;
      }
    }
  }

  return true;
}

function transformParams(
  query: Query,
  neededParameters: RawConfig,
): ReadyConfig<RawConfig> {
  const result = {} as ReadyConfig<RawConfig>;

  for (const key in neededParameters) {
    const parameterType = neededParameters[key];

    const data = query[key] as string;

    if (Array.isArray(parameterType)) {
      const arrayData = query[key] as string[];

      // @ts-expect-error dummy ts
      result[key] = arrayData;
      continue;
    }

    switch (typeof parameterType) {
      case 'number': {
        // @ts-expect-error dummy ts
        result[key] = isNaN(parseInt(data)) ? parseFloat(data) : parseInt(data);

        break;
      }
      case 'object': {
        // @ts-expect-error dummy ts
        result[key] = JSON.parse(data);

        break;
      }
      case 'string': {
        // @ts-expect-error dummy ts
        result[key] = data;
      }
      case 'boolean': {
        // @ts-expect-error dummy ts
        result[key] = data === '1' || data === 'true';

        break;
      }
    }

    switch (parameterType) {
      case parameters.any:
      case parameters.string:
      case parameters.array: {
        // @ts-expect-error dummy ts
        result[key] = query[key];

        break;
      }
      case parameters.number: {
        const data = query[key] as string;

        // @ts-expect-error dummy ts
        result[key] = isNaN(parseInt(data)) ? parseFloat(data) : parseInt(data);

        break;
      }
      case parameters.boolean: {
        const data = query[key] as string;

        // @ts-expect-error dummy ts
        result[key] = data === '1' || data === 'true';

        break;
      }
    }
  }

  return result;
}

type FactoryPayload = {
  $activeRoutes: Store<Route<any>[]>;
  $query: Store<Query>;
  $path: Store<string>;
  navigateFx: Effect<NavigatePayload, void>;
};

export function trackQueryFactory({
  $activeRoutes,
  $path,
  $query,
  navigateFx,
}: FactoryPayload) {
  return <T extends RawConfig>(
    config: QueryTrackerConfig<T>,
  ): QueryTracker<T> => {
    const { parameters, forRoutes } = config;

    const $entered = createStore(false);

    const entered = createEvent<ReadyConfig<T>>();
    const exited = createEvent();

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
        isHaveValidParams(query, parameters),
      fn: ({ query }) => transformParams(query, parameters) as ReadyConfig<T>,
      target: [entered, changeEntered.prepend(() => true)],
    });

    sample({
      source: { activeRoutes: $activeRoutes, query: $query, entered: $entered },
      filter: ({ activeRoutes, query, entered }) =>
        entered &&
        !(
          (!forRoutes || isForRouteActive(forRoutes, activeRoutes)) &&
          isHaveValidParams(query, parameters)
        ),
      target: [
        exited.prepend(() => undefined),
        changeEntered.prepend(() => false),
      ],
    });

    sample({
      clock: exit,
      source: { path: $path, query: $query },
      fn: ({ path, query }, payload) => {
        if (payload && payload.ignoreParams) {
          const copy: Query = {};

          for (const key of payload.ignoreParams) {
            if (query[key]) {
              copy[key] = query[key];
            }
          }

          return { query: copy, path };
        }

        return { query: {}, path };
      },
      target: navigateFx,
    });

    return {
      entered,
      exited,
      exit,
    };
  };
}
