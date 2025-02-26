import { describe, expect, test } from 'vitest';
import { chainRoute, createRoute, RouteOpenedPayload } from '../lib';
import { allSettled, createEffect, createEvent, fork, sample } from 'effector';

describe('chained routes', () => {
  test('authorized route', async () => {
    const scope = fork();

    const route = createRoute({ path: '/profile/:id' });

    const authorized = createEvent();
    const rejected = createEvent();

    const checkAuthorizationFx = createEffect<
      RouteOpenedPayload<{ id: string }>,
      boolean
    >(async ({ params }) => params.id !== '0');

    sample({
      clock: checkAuthorizationFx.doneData,
      filter: (isAuthorized) => isAuthorized,
      target: authorized,
    });

    sample({
      clock: checkAuthorizationFx.doneData,
      filter: (isAuthorized) => !isAuthorized,
      target: rejected,
    });

    const virtual = chainRoute({
      route,
      beforeOpen: checkAuthorizationFx,
      openOn: authorized,
      cancelOn: rejected,
    });

    await allSettled(route.open, {
      scope,
      params: { params: { id: '0' } },
    });

    expect(scope.getState(virtual.$isOpened)).toBeFalsy();

    await allSettled(route.open, {
      scope,
      params: { params: { id: '1' } },
    });

    expect(scope.getState(virtual.$isOpened)).toBeTruthy();
  });
});
