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

  test('virtual route groupping works correctly', async () => {
    const scope = fork();
    const virtualRoute = createVirtualRoute({
      transformer: (_: RouteOpenedPayload<void>) => null,
    });

    const routesGroup = group([virtualRoute]);

    expect(scope.getState(routesGroup.$isOpened)).toBeFalseWithMessage(
      '[1] Routes group must be false cause virtual route is closed',
    );

    await allSettled(virtualRoute.open, { scope, params: {} });

    expect(scope.getState(routesGroup.$isOpened)).toBeTrueWithMessage(
      '[2] Routes group must be true cause virtual route is opened',
    );

    await allSettled(virtualRoute.close, { scope });

    expect(scope.getState(routesGroup.$isOpened)).toBeFalseWithMessage(
      '[3] Routes group must be false cause virtual route is closed',
    );
  });
});
