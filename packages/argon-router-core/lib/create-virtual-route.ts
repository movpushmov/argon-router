import {
  createEvent,
  createStore,
  Effect,
  sample,
  split,
  Store,
} from 'effector';

import { VirtualRoute } from './types';

interface VirtualRouteOptions<T, TransformerResult> {
  beforeOpen?: Effect<void, any, any>[];
  $isPending?: Store<boolean>;
  transformer?: (payload: T) => TransformerResult;
}

export function createVirtualRoute<T = void, TransformerResult = void>(
  options: VirtualRouteOptions<T, TransformerResult> = {},
): VirtualRoute<T, TransformerResult> {
  const {
    beforeOpen,
    $isPending = createStore(false),
    transformer = (payload) => (payload ?? null) as TransformerResult,
  } = options;

  const $params = createStore<TransformerResult>(null as TransformerResult);
  const $isOpened = createStore(false);

  const open = createEvent<T>();
  const opened = createEvent<T>();

  const openedOnServer = createEvent<T>();
  const openedOnClient = createEvent<T>();

  const close = createEvent();
  const closed = createEvent();

  const cancelled = createEvent();

  sample({
    clock: open,
    target: [opened],
  });

  sample({
    clock: open,
    fn: transformer,
    target: $params,
  });

  split({
    source: opened,
    match: () => (typeof window === 'undefined' ? 'server' : 'client'),
    cases: {
      server: openedOnServer,
      client: openedOnClient,
    },
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
    opened,

    openedOnClient,
    openedOnServer,

    close,
    closed,

    cancelled,

    path: '',
    beforeOpen,

    '@@unitShape': () => ({
      params: $params,
      isOpened: $isOpened,
      isPending: $isPending,

      onOpen: open,
      onClose: close,
    }),
  };
}
