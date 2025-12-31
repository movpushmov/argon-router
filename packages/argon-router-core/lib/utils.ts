import type { PathlessRoute, PathRoute, Route, Router } from './types';

export const is = {
  route<T extends object | void = void>(input: unknown): input is Route<T> {
    return is.pathRoute(input) || is.pathlessRoute(input);
  },

  pathRoute<T extends object | void = void>(
    input: unknown,
  ): input is PathRoute<T> {
    return (
      typeof input === 'object' &&
      input !== null &&
      '@@type' in input &&
      input['@@type'] === 'path-route'
    );
  },

  pathlessRoute<T extends object | void = void>(
    input: unknown,
  ): input is PathlessRoute<T> {
    return (
      typeof input === 'object' &&
      input !== null &&
      '@@type' in input &&
      input['@@type'] === 'pathless-route'
    );
  },

  router(input: unknown): input is Router {
    return (
      typeof input === 'object' &&
      input !== null &&
      '@@type' in input &&
      input['@@type'] === 'router'
    );
  },
};
