import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  type Effect,
} from 'effector';
import type {
  AsyncBundleImport,
  InternalRoute,
  PathlessRoute,
  PathRoute,
  Route,
  RouteOpenedPayload,
} from './types';

import { ParseUrlParams, ValidatePath } from '@argon-router/paths';
import { createAction } from 'effector-action';

type WithBaseRouteConfig<T = void> = T & {
  parent?: Route<any>;
  beforeOpen?: Effect<void, any, any>[];
};

export type CreateRouteConfig<Path> =
  ValidatePath<Path> extends ['invalid', infer Template]
    ? WithBaseRouteConfig<{
        path: Template;
      }>
    : WithBaseRouteConfig<{
        path: Path;
        parent?: Route<any>;
        beforeOpen?: Effect<void, any, any>[];
      }>;
/**
 * @description Creates argon route
 * @param config Route config
 * @returns `Route\<Params\>`
 * @link https://movpushmov.dev/argon-router/core/create-route.html
 * @example ```ts
 * import { createRoute } from '@argon-router/core';
 *
 * // basic
 * const route = createRoute({ path: '/route' });
 * route.open();
 *
 * // with params
 * const postRoute = createRoute({ path: '/post/:id' });
 * //       ^---  Route<{ id: string }>
 *
 * // with parent
 * const profile = createRoute({ path: '/profile/:id' });
 *
 * const friends = createRoute({ path: '/friends', parent: profile });
 * const posts = createRoute({ path: '/posts', parent: profile });
 *
 * posts.open(); // profile.$isOpened -> true, posts.$isOpened -> true
 * ```
 */
export function createRoute<
  T extends string,
  Params extends object | void = ParseUrlParams<T>,
>(config: CreateRouteConfig<T>): PathRoute<Params>;
export function createRoute<Params extends object | void = void>(
  config?: WithBaseRouteConfig,
): PathlessRoute<Params>;
export function createRoute<Params>(
  config:
    | WithBaseRouteConfig
    | CreateRouteConfig<any> = {} as WithBaseRouteConfig,
): PathRoute<any> | PathlessRoute<any> {
  let asyncImport: AsyncBundleImport;

  const beforeOpen = config.beforeOpen ?? [];

  const openFx = createEffect<OpenPayload, OpenPayload>(async (payload) => {
    await waitForAsyncBundleFx();
    await beforeOpenFx();

    const parent = config.parent as InternalRoute | undefined;

    if (parent) {
      await parent.internal.openFx({
        ...(payload ?? { params: {} }),
        navigate: false,
      });
    }

    return payload;
  });

  const forceOpenParentFx = createEffect<OpenPayload, OpenPayload>(
    async (payload) => {
      const parent = config.parent as InternalRoute | undefined;

      if (parent) {
        await parent.internal.forceOpenParentFx({
          ...(payload ?? { params: {} }),
          navigate: false,
        });
      }

      return payload;
    },
  );

  const navigatedFx = attach({ effect: openFx });

  type OpenPayload = RouteOpenedPayload<Params>;

  const $params = createStore<Params>({} as Params);

  const $isOpened = createStore(false);
  const $isPending = openFx.pending;

  const open = createEvent<OpenPayload>();
  const close = createEvent();

  const opened = createEvent<OpenPayload>();
  const openedOnServer = createEvent<OpenPayload>();
  const openedOnClient = createEvent<OpenPayload>();

  const navigated = createEvent<OpenPayload>();

  const closed = createEvent();

  const waitForAsyncBundleFx = createEffect(() => asyncImport?.());

  const beforeOpenFx = createEffect(async () => {
    for (const fx of beforeOpen) {
      await fx();
    }
  });

  const defaultParams = {} as Params;

  sample({
    clock: open,
    target: openFx,
  });

  sample({
    clock: navigated,
    fn: (payload) => ({ navigate: false, ...payload }),
    target: navigatedFx,
  });

  sample({
    clock: navigatedFx.done,
    fn: ({ params }) => params,
    target: forceOpenParentFx,
  });

  createAction({
    clock: [navigatedFx.doneData, forceOpenParentFx.doneData],
    target: { $params },
    fn: (target, payload) => {
      if (!payload) {
        return target.$params(defaultParams);
      }

      return target.$params(
        'params' in payload ? { ...payload.params } : defaultParams,
      );
    },
  });

  sample({
    clock: navigatedFx.failData,
    fn: () => defaultParams,
    target: $params,
  });

  createAction({
    clock: [navigatedFx.doneData, forceOpenParentFx.doneData],
    target: {
      openedOnServer,
      openedOnClient,
    },
    fn: (target, payload) => {
      if (typeof window === 'undefined') {
        return target.openedOnServer(payload);
      }

      return target.openedOnClient(payload);
    },
  });

  // @ts-expect-error TS is very stupid
  sample({
    clock: [openedOnClient, openedOnServer],
    target: opened,
  });

  sample({
    clock: close,
    target: closed,
  });

  sample({
    clock: [opened.map(() => true), closed.map(() => false)],
    target: $isOpened,
  });

  return {
    $params,
    $isOpened,
    $isPending,

    // @ts-expect-error :((
    open,
    closed,
    opened,
    openedOnClient,
    openedOnServer,

    ...config,

    internal: {
      navigated,
      close,
      openFx,
      forceOpenParentFx,

      setAsyncImport: (value: AsyncBundleImport) => (asyncImport = value),
    },

    '@@unitShape': () => ({
      params: $params,
      isPending: $isPending,
      isOpened: $isOpened,

      // @ts-expect-error :((
      onOpen: open,
    }),
  };
}
