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
  beforeOpen?: Effect<void, any, any>[];
}

type SafeParams<T> = T extends Record<string, never> ? void : T;

export function createRoute<
  T extends string,
  Params = SafeParams<ParseUrlParams<T>>,
>(config: Config<T>): Route<Params> {
  let asyncImport: AsyncBundleImport;

  type OpenPayload = RouteOpenedPayload<Params>;

  const waitForAsyncBundleFx = createEffect(() => asyncImport?.());

  const beforeOpenFx = createEffect(async () => {
    for (const fx of config.beforeOpen ?? []) {
      await fx();
    }
  });

  const openFx = createEffect(async (payload: OpenPayload) => {
    await waitForAsyncBundleFx();
    await beforeOpenFx();

    const parent = config.parent as InternalRoute | undefined;

    if (parent) {
      await parent.internal.openFx({
        ...(payload ?? { params: {} }),
        historyIgnore: true,
      });
    }

    return payload;
  });

  const $params = createStore<Params>({} as Params);

  const $isOpened = createStore(false);
  const $isPending = openFx.pending;

  const open = createEvent<OpenPayload>();
  const close = createEvent();

  const opened = createEvent<OpenPayload>();
  const openedOnServer = createEvent<OpenPayload>();
  const openedOnClient = createEvent<OpenPayload>();

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

  // @ts-expect-error TS is very stupid
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
    clock: close,
    target: closed,
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
      close,
      openFx: openFx as Effect<any, any, any>,
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
