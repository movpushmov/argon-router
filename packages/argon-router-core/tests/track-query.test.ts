import { allSettled, fork } from 'effector';
import { createMemoryHistory } from 'history';
import { describe, expect, test } from 'vitest';
import { createRouter, createRoute, parameters } from '../lib';
import { watchCalls } from './utils';

async function prepare() {
  const routes = {
    home: createRoute({ path: '/' }),
    app: createRoute({ path: '/app' }),
  };

  const scope = fork();
  const history = createMemoryHistory({ initialEntries: ['/'] });
  const router = createRouter({
    routes: [routes.home, routes.app],
  });

  await allSettled(router.setHistory, { scope, params: history });

  return { routes, scope, history, router };
}

describe('trackQuery', () => {
  test('number parameter', async () => {
    const { router, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        num: parameters.number,
      },
    });

    const enteredCalls = watchCalls(tracker.entered, scope);
    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { num: '1200' } },
    });

    expect(enteredCalls).toBeCalledWith({ num: 1200 });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { num: 'hello' } },
    });

    expect(enteredCalls).toBeCalledTimes(1);
    expect(exitedCalls).toBeCalledTimes(1);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { num: ['hello', '1200'] } },
    });

    expect(enteredCalls).toBeCalledTimes(1);
    expect(exitedCalls).toBeCalledTimes(1);
  });

  test('string parameter', async () => {
    const { router, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        str: parameters.string,
      },
    });

    const enteredCalls = watchCalls(tracker.entered, scope);
    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { str: '1200' } },
    });

    expect(enteredCalls).toBeCalledWith({ str: '1200' });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { str: 'hello' } },
    });

    expect(enteredCalls).toBeCalledWith({ str: 'hello' });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { str: ['hello', '1200'] } },
    });

    expect(enteredCalls).toBeCalledTimes(2);
    expect(exitedCalls).toBeCalledTimes(1);
  });

  test('any parameter', async () => {
    const { router, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        any: parameters.any,
      },
    });

    const enteredCalls = watchCalls(tracker.entered, scope);
    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { any: '1200' } },
    });

    expect(enteredCalls).toBeCalledWith({ any: '1200' });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { any: 'hello' } },
    });

    expect(enteredCalls).toBeCalledWith({ any: 'hello' });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { any: ['hello', '1200'] } },
    });

    expect(enteredCalls).toBeCalledWith({ any: ['hello', '1200'] });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: {} },
    });

    expect(enteredCalls).toBeCalledTimes(3);
    expect(exitedCalls).toBeCalledTimes(1);
  });

  test('array parameter', async () => {
    const { router, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        any: parameters.any,
      },
    });

    const enteredCalls = watchCalls(tracker.entered, scope);
    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { any: ['hello', '1200'] } },
    });

    expect(enteredCalls).toBeCalledWith({ any: ['hello', '1200'] });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: {} },
    });

    expect(enteredCalls).toBeCalledTimes(1);
    expect(exitedCalls).toBeCalledTimes(1);
  });

  test('boolean parameter', async () => {
    const { router, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        bool: parameters.boolean,
      },
    });

    const enteredCalls = watchCalls(tracker.entered, scope);
    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { bool: '0' } },
    });

    expect(enteredCalls).toBeCalledWith({ bool: false });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { bool: '1' } },
    });

    expect(enteredCalls).toBeCalledWith({ bool: true });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { bool: 'false' } },
    });

    expect(enteredCalls).toBeCalledWith({ bool: false });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { bool: 'true' } },
    });

    expect(enteredCalls).toBeCalledWith({ bool: true });

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { bool: '123' } },
    });

    expect(enteredCalls).toBeCalledTimes(4);
    expect(exitedCalls).toBeCalledTimes(1);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { bool: 'hello' } },
    });

    expect(enteredCalls).toBeCalledTimes(4);
    expect(exitedCalls).toBeCalledTimes(1);

    await allSettled(router.navigate, {
      scope,
      params: { path: '/', query: { bool: ['0', 'hello'] } },
    });

    expect(enteredCalls).toBeCalledTimes(4);
    expect(exitedCalls).toBeCalledTimes(1);
  });

  test.only('for routes', async () => {
    const { router, routes, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        any: parameters.any,
      },
      forRoutes: [routes.app, routes.home],
    });

    const enteredCalls = watchCalls(tracker.entered, scope);
    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      params: { path: '/not-found', query: { any: '123' } },
      scope,
    });

    expect(enteredCalls).not.toBeCalled();

    await allSettled(router.navigate, {
      params: { path: '/app', query: { any: '123' } },
      scope,
    });

    expect(enteredCalls).toBeCalledTimes(1);

    await allSettled(router.navigate, {
      params: { path: '/', query: { any: '123' } },
      scope,
    });

    expect(enteredCalls).toBeCalledTimes(2);

    await allSettled(router.navigate, {
      params: { path: '/not-found', query: { any: '123' } },
      scope,
    });

    expect(exitedCalls).toBeCalledTimes(1);
  });

  test('exit', async () => {
    const { router, routes, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        any: parameters.any,
      },
      forRoutes: [routes.app, routes.home],
    });

    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      params: { path: '/not-found', query: { any: '123' } },
      scope,
    });

    await allSettled(tracker.exit, { scope, params: undefined });

    expect(exitedCalls).not.toBeCalled();

    await allSettled(router.navigate, {
      params: { path: '/', query: { any: '123', uid: 'hi!' } },
      scope,
    });

    await allSettled(tracker.exit, { scope, params: undefined });

    expect(exitedCalls).toBeCalled();
    expect(scope.getState(router.$query)).toStrictEqual({});
  });

  test('ignore parameters', async () => {
    const { router, routes, scope } = await prepare();
    const tracker = router.trackQuery({
      parameters: {
        any: parameters.any,
      },
      forRoutes: [routes.app, routes.home],
    });

    const exitedCalls = watchCalls(tracker.exited, scope);

    await allSettled(router.navigate, {
      params: { path: '/not-found', query: { any: '123' } },
      scope,
    });

    await allSettled(tracker.exit, { scope, params: undefined });

    expect(exitedCalls).not.toBeCalled();

    await allSettled(router.navigate, {
      params: { path: '/', query: { any: '123', uid: 'hi!' } },
      scope,
    });

    await allSettled(tracker.exit, {
      scope,
      params: { ignoreParams: ['uid'] },
    });

    expect(exitedCalls).toBeCalled();
    expect(scope.getState(router.$query)).toStrictEqual({ uid: 'hi!' });
  });
});
