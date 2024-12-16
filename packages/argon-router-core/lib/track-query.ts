import { createEvent, sample, Store } from 'effector';
import {
  Query,
  QueryTracker,
  QueryTrackerConfig,
  RawConfig,
  ReadyConfig,
  Route,
} from './types';
import { parameters } from './const';

function isNeededRoutesActive(
  forRoutes: Route<any>[],
  activeRoutes: Route<any>[],
) {
  for (const route of forRoutes) {
    if (!activeRoutes.includes(route)) {
      return false;
    }
  }

  return true;
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

    const data = query[key];

    if (Array.isArray(parameterType)) {
      // @ts-expect-error dummy ts
      result[key] = data === '1' || data === 'true';
      continue;
    }

    switch (typeof parameterType) {
      case 'number': {
        const data = query[key] as string;

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
        result[key] = query[key];
      }
      case 'boolean': {
        const data = query[key] as string;

        // @ts-expect-error dummy ts
        result[key] = data === '0' ? parseFloat(data) : parseInt(data);

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
    }
  }

  return result;
}

export function trackQueryFactory(
  $activeRoutes: Store<Route<any>[]>,
  $query: Store<Query>,
) {
  return <T extends RawConfig>(
    config: QueryTrackerConfig<T>,
  ): QueryTracker<T> => {
    const { parameters, forRoutes } = config;

    const entered = createEvent<ReadyConfig<T>>();
    const exited = createEvent();

    const exit = createEvent<{ ignoreParams: string[] } | void>();

    sample({
      source: { activeRoutes: $activeRoutes, query: $query },
      filter: ({ activeRoutes, query }) =>
        (!forRoutes || isNeededRoutesActive(forRoutes, activeRoutes)) &&
        isHaveValidParams(query, parameters),
      fn: ({ query }) => transformParams(query, parameters),
    });

    sample({
      source: { activeRoutes: $activeRoutes, query: $query },
      filter: ({ activeRoutes, query }) =>
        !(
          (!forRoutes || isNeededRoutesActive(forRoutes, activeRoutes)) &&
          isHaveValidParams(query, parameters)
        ),
      target: exited,
    });

    return {
      entered,
      exited,
      exit,
      getPayload: (config: ReadyConfig<T>) => {
        return Object.entries(config).reduce<Record<string, any>>(
          (acc, [key, value]) => {
            if (typeof parameters[key] === 'symbol') {
              acc[key] = value;
            } else {
              acc[key] = parameters[key];
            }

            return acc;
          },
          {},
        );
      },
    };
  };
}
