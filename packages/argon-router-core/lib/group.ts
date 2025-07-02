import { sample } from 'effector';
import { createVirtualRoute } from './chain-route';
import type { Route } from './types';
import { not, or } from 'patronum';

/**
 * @description Create virtual route which opens when some passed routes is opened. Closes if all passed routes are closed.
 * @link https://movpushmov.dev/argon-router/core/group.html
 * @returns VirtualRoute
 * @example ```ts
 * import { group, createRoute } from '@argon-router/core';
 * import { createEvent, createEffect } from 'effector';
 *
 * const signInRoute = createRoute({ path: '/auth/sign-in' });
 * const signUpRoute = createRoute({ path: '/auth/sign-up' });
 * const authorizationRoute = group([signInRoute, signUpRoute]);
 *
 * signInRoute.open(); // authorizationRoute.$isOpened —> true
 * signUpRoute.open(); // authorizationRoute.$isOpened —> true
 * signInRoute.close(); // authorizationRoute.$isOpened —> true
 * signUpRoute.close(); // authorizationRoute.$isOpened —> false
 * ```
 */
export function group(routes: Route<any>[]) {
  const $isPending = or(...routes.map((route) => route.$isPending));
  const virtual = createVirtualRoute<void>($isPending);

  sample({
    clock: routes.map((route) => route.$isOpened),
    filter: or(...routes.map((route) => route.$isOpened)),
    fn: () => undefined,
    target: virtual.open,
  });

  sample({
    clock: routes.map((route) => route.$isOpened),
    filter: not(or(...routes.map((route) => route.$isOpened))),
    fn: () => undefined,
    target: virtual.close,
  });

  return virtual;
}
