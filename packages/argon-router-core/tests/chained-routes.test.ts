import { describe, expect, test } from 'vitest';
import {
  chainRoute,
  createRoute,
  RouteOpenedPayload,
  createRouter,
  historyAdapter,
  createVirtualRoute,
} from '../lib';
import { allSettled, createEffect, createEvent, fork, sample } from 'effector';
import { createMemoryHistory } from 'history';
import { watchCalls } from './utils';

describe('chained routes', () => {
  test('authorized route', async () => {
    const scope = fork();

    const route = createRoute({ path: '/profile/:id' });
    const router = createRouter({ routes: [route] });

    await allSettled(router.setHistory, {
      params: historyAdapter(createMemoryHistory()),
      scope,
    });

    const authorized = createEvent();
    const rejected = createEvent();

    const checkAuthorizationFx = createEffect<
      RouteOpenedPayload<{ id: string }>,
      boolean
    >(({ params }) => params.id !== '0');

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
    expect(scope.getState(virtual.$params)).toStrictEqual({ id: '1' });
  });

  test('virtual route groupping', async () => {
    const scope = fork();
    const virtualRoute = createVirtualRoute<RouteOpenedPayload<void>>();

    const fx = createEffect((params: RouteOpenedPayload<void>) => params);

    const counter = watchCalls(fx, scope);

    const chainedRoute = chainRoute({
      route: virtualRoute,
      beforeOpen: [fx],
      openOn: fx.doneData,
    });

    expect(counter).not.toBeCalled();

    await allSettled(virtualRoute.open, {
      scope,
      params: { query: { test: 'abc' } },
    });

    expect(counter).toBeCalled();
    expect(counter.mock.calls[0]).toStrictEqual([
      {
        query: {
          test: 'abc',
        },
      },
    ]);
    expect(scope.getState(chainedRoute.$isOpened)).toBeTrueWithMessage(
      'Chained route is must be opened',
    );
  });
});
