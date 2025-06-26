import {
  createEffect,
  createEvent,
  createStore,
  Effect,
  sample,
  split,
} from 'effector';
import {
  AsyncBundleImport,
  InternalRoute,
  Route,
  RouteOpenedPayload,
} from './types';

import { ParseUrlParams, ValidatePath } from '@argon-router/paths';

export type CreateRouteConfig<Path> =
  ValidatePath<Path> extends ['invalid', infer Template]
    ? {
        path: Template;
        parent?: Route<any>;
        beforeOpen?: Effect<void, any, any>[];
      }
    : {
        path: Path;
        parent?: Route<any>;
        beforeOpen?: Effect<void, any, any>[];
      };
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
export function createRoute<T extends string, Params = ParseUrlParams<T>>(
  config: CreateRouteConfig<T>,
): Route<Params> {
  let asyncImport: AsyncBundleImport;

  type OpenPayload = RouteOpenedPayload<Params>;

  const waitForAsyncBundleFx = createEffect(() => asyncImport?.());

  const beforeOpenFx = createEffect(async () => {
    for (const fx of config.beforeOpen ?? []) {
      await fx();
    }
  });

  const openFx = createEffect<OpenPayload, RouteOpenedPayload<Params>>(
    async (payload: OpenPayload) => {
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
    },
  );

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

  sample({
    clock: open,
    target: openFx,
  });

  const defaultParams = {} as Params;

  sample({
    clock: navigated,
    fn: (payload): Params => {
      if (!payload) {
        return defaultParams;
      }

      return 'params' in payload ? { ...payload.params } : defaultParams;
    },
    target: $params,
  });

  split({
    source: navigated,
    match: () => (typeof window === 'undefined' ? 'server' : 'client'),
    cases: {
      server: openedOnServer,
      client: openedOnClient,
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

    open,
    closed,
    opened,
    openedOnClient,
    openedOnServer,

    ...config,

    internal: {
      navigated,
      close,
      openFx: openFx as Effect<any, any, any>,
      setAsyncImport: (value: AsyncBundleImport) => (asyncImport = value),
    },

    '@@unitShape': () => ({
      params: $params,
      isPending: $isPending,
      isOpened: $isOpened,
      onOpen: open,
    }),
  } as InternalRoute<Params>;
}
