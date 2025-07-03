import { allSettled, fork } from 'effector';
import { describe, expect, test } from 'vitest';
import { createVirtualRoute, group, RouteOpenedPayload } from '../lib';

describe('routes groupping', () => {
  test('groupped route opened when one of passed routes is opened', async () => {
    const scope = fork();

    const route1 = createVirtualRoute<RouteOpenedPayload<void>, void>();
    const route2 = createVirtualRoute<RouteOpenedPayload<void>, void>();

    const groupped = group([route1, route2]);

    expect(scope.getState(groupped.$isOpened)).toBeFalsy();

    await allSettled(route1.open, { scope, params: undefined });

    expect(scope.getState(groupped.$isOpened)).toBeTruthy();

    await allSettled(route1.close, { scope, params: undefined });
    await allSettled(route2.open, { scope, params: undefined });

    expect(scope.getState(route1.$isOpened)).toBeFalsy();
    expect(scope.getState(groupped.$isOpened)).toBeTruthy();
  });

  test('groupped route closed when all of passed routes is closed', async () => {
    const scope = fork();

    const route1 = createVirtualRoute<RouteOpenedPayload<void>, void>();
    const route2 = createVirtualRoute<RouteOpenedPayload<void>, void>();

    const groupped = group([route1, route2]);

    await allSettled(route1.open, { scope, params: undefined });
    await allSettled(route2.open, { scope, params: undefined });

    expect(scope.getState(groupped.$isOpened)).toBeTruthy();

    await allSettled(route1.close, { scope, params: undefined });

    expect(scope.getState(groupped.$isOpened)).toBeTruthy();

    await allSettled(route2.close, { scope, params: undefined });

    expect(scope.getState(groupped.$isOpened)).toBeFalsy();
  });
});
