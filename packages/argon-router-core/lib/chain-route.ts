import {
  createEffect,
  createEvent,
  createStore,
  Effect,
  EventCallable,
  sample,
  split,
  Store,
  Unit,
} from 'effector';
import { Route, RouteOpenedPayload, VirtualRoute } from './types';

type BeforeOpenUnit<T> =
  | EventCallable<RouteOpenedPayload<T>>
  | Effect<RouteOpenedPayload<T>, any>;

interface ChainRouteProps<T> {
  route: Route<T>;
  beforeOpen: BeforeOpenUnit<T> | BeforeOpenUnit<T>[];
  openOn?: Unit<any> | Unit<any>[];
  cancelOn?: Unit<any> | Unit<any>[];
}

function createVirtualRoute<T>(pending: Store<boolean>): VirtualRoute<T> {
  const $params = createStore<T>(null as T);
  const $isOpened = createStore(false);
  const $isPending = pending;

  const open = createEvent<RouteOpenedPayload<T>>();

  const opened = createEvent<RouteOpenedPayload<T>>();
  const openedOnServer = createEvent<RouteOpenedPayload<T>>();
  const openedOnClient = createEvent<RouteOpenedPayload<T>>();

  const close = createEvent();
  const closed = createEvent();

  sample({
    clock: open,
    target: opened,
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

    '@@unitShape': () => ({
      params: $params,
      isOpened: $isOpened,
      isPending: $isPending,

      onOpen: open,
    }),
  };
}

export function chainRoute<T>(props: ChainRouteProps<T>): VirtualRoute<T> {
  const { route, beforeOpen, openOn, cancelOn } = props;

  const openFx = createEffect(async (payload: RouteOpenedPayload<T>) => {
    for (const trigger of (<BeforeOpenUnit<T>[]>[]).concat(beforeOpen)) {
      await trigger(payload);
    }
  });

  const virtualRoute = createVirtualRoute<T>(openFx.pending);

  sample({
    clock: route.opened,
    target: openFx,
  });

  sample({
    clock: route.opened,
    fn: (payload) =>
      (payload && 'params' in payload ? payload.params : null) as T,
    target: virtualRoute.$params,
  });

  if (openOn) {
    // @ts-expect-error ...
    sample({
      clock: openOn,
      source: { params: virtualRoute.$params },
      fn: ({ params }) => ({ params }) as unknown as RouteOpenedPayload<T>,
      target: virtualRoute.open,
    });
  }

  if (cancelOn) {
    sample({
      clock: (<Unit<void>[]>[route.closed]).concat(cancelOn),
      target: virtualRoute.close,
    });
  }

  return virtualRoute;
}
