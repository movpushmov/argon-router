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

import { ParseUrlParams } from 'typed-url-params';

interface Config<T> {
  path: T;

  parent?: Route<any>;
  index?: boolean;

  beforeOpen?: Effect<any, any, any>[];
}

export function createRoute<T extends string, Params = ParseUrlParams<T>>(
  config: Config<T>,
): Route<Params> {
  let asyncImport: AsyncBundleImport;

  const waitForAsyncBundleFx = createEffect(() => asyncImport?.());

  const openFx = createEffect(async (payload: RouteOpenedPayload<Params>) => {
    await waitForAsyncBundleFx();

    if (config.parent) {
      await (config.parent as InternalRoute<any>).internal.openFx(payload);
    }

    return payload;
  });

  const $params = createStore<Params>({} as Params);

  const $isOpened = createStore(false);
  const $isPending = openFx.pending;

  const open = createEvent<RouteOpenedPayload<Params>>();
  const close = createEvent();

  const opened = createEvent<RouteOpenedPayload<Params>>();
  const openedOnServer = createEvent<RouteOpenedPayload<Params>>();
  const openedOnClient = createEvent<RouteOpenedPayload<Params>>();

  const closed = createEvent();

  sample({
    clock: open,
    target: openFx,
  });

  split({
    source: openFx.doneData,
    match: () => (typeof window === 'undefined' ? 'server' : 'client'),
    cases: {
      server: openedOnServer,
      client: openedOnClient,
    },
  });

  sample({
    clock: [openedOnClient, openedOnServer],
    target: opened,
  });

  sample({
    clock: opened,
    fn: () => true,
    target: $isOpened,
  });

  sample({
    clock: closed,
    fn: () => false,
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

    internal: {
      index: false,
      close,
      openFx,
      setAsyncImport: (value: AsyncBundleImport) => (asyncImport = value),
      ...config,
    },

    '@@unitShape': () => ({
      params: $params,
      isPending: $isPending,
      isOpened: $isOpened,
      onOpen: open,
    }),
  } as InternalRoute<Params>;
}
