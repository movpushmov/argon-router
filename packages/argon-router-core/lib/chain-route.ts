import { createEffect, Effect, EventCallable, sample, Unit } from 'effector';
import {
  AsyncBundleImport,
  OpenPayloadBase,
  Route,
  RouteOpenedPayload,
  VirtualRoute,
} from './types';
import { createVirtualRoute } from './create-virtual-route';

type BeforeOpenUnit<T> =
  | (T extends void
      ? EventCallable<void> | EventCallable<OpenPayloadBase>
      : EventCallable<{ params: T } & OpenPayloadBase>)
  | Effect<RouteOpenedPayload<T>, any>;

interface ChainRouteProps<T> {
  route: Route<T>;
  beforeOpen: BeforeOpenUnit<T> | BeforeOpenUnit<T>[];
  openOn?: Unit<any> | Unit<any>[];
  cancelOn?: Unit<any> | Unit<any>[];
}

/**
 * @link https://movpushmov.dev/argon-router/core/chain-route.html
 * @param props Chain route props
 * @returns `Virtual route`
 * @example ```ts
 * import { createRoute, chainRoute } from '@argon-router/core';
 * import { createEvent, createEffect } from 'effector';
 *
 * // base example
 * const route = createRoute({ path: '/profile' });
 *
 * const authorized = createEvent();
 * const rejected = createEvent();
 *
 * const checkAuthorizationFx = createEffect(async ({ params }) => {
 *     // some logic
 * });
 *
 * sample({
 *   clock: checkAuthorizationFx.doneData,
 *   target: authorized,
 * });
 *
 * sample({
 *   clock: checkAuthorizationFx.failData,
 *   target: rejected,
 * });
 *
 * const virtual = chainRoute({
 *   route,
 *   beforeOpen: checkAuthorizationFx,
 *   openOn: authorized,
 *   cancelOn: rejected,
 * });
 *
 * // chain already chained routes
 * const postRoute = createRoute({ path: '/post/:id' });
 * const authorizedRoute = chainRoute({ route: postRoute, ... });
 * const postLoadedRoute = chainRoute({ route: authorizedRoute, ... });
 * ```
 */
export function chainRoute<T>(
  props: ChainRouteProps<T>,
): VirtualRoute<RouteOpenedPayload<T>, T> {
  const { route, beforeOpen, openOn, cancelOn } = props;

  let asyncImport: AsyncBundleImport;

  const waitForAsyncBundleFx = createEffect(() => asyncImport?.());

  const openFx = createEffect(async (payload: RouteOpenedPayload<T>) => {
    await waitForAsyncBundleFx();

    for (const trigger of (<BeforeOpenUnit<T>[]>[]).concat(beforeOpen)) {
      // @ts-expect-error -- ts works very awful with this generics
      await trigger(payload);
    }
  });

  const transformer = (payload: RouteOpenedPayload<T>): T => {
    if (!payload) {
      return null as T;
    }

    return 'params' in payload ? payload.params : (null as T);
  };

  const virtualRoute = createVirtualRoute<RouteOpenedPayload<T>, T>({
    transformer,
  });

  sample({
    clock: route.opened,
    target: openFx,
  });

  sample({
    clock: route.opened,
    fn: transformer,
    target: virtualRoute.$params,
  });

  if (openOn) {
    sample({
      clock: openOn as Unit<any>[],
      source: virtualRoute.$params,
      fn: (params) => ({ params }) as unknown as RouteOpenedPayload<T>,
      target: virtualRoute.open,
    });
  }

  if (cancelOn) {
    sample({
      clock: (<Unit<void>[]>[route.closed]).concat(cancelOn),
      target: virtualRoute.close,
    });

    sample({
      clock: (<Unit<void>[]>[]).concat(cancelOn),
      target: virtualRoute.cancelled as EventCallable<void>,
    });
  }

  return Object.assign(virtualRoute, {
    internal: {
      setAsyncImport: (value: AsyncBundleImport) => (asyncImport = value),
    },
  });
}
