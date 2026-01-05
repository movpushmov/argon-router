import { allSettled, createEffect, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';
import { createRoute, createRouter, historyAdapter } from '../lib';
import { createMemoryHistory } from 'history';

describe('router', () => {
  test('routes opened when path changed', async () => {
    const route1 = createRoute({ path: '/one' });
    const route2 = createRoute({ path: '/two' });

    const scope = fork();
    const history = createMemoryHistory();

    const router = createRouter({
      routes: [route1, route2],
    });

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    history.push('/one');

    await allSettled(scope);

    expect(scope.getState(router.$activeRoutes)[0]).toEqual(route1);
    expect(scope.getState(route1.$isOpened)).toBeTruthy();
  });

  test('routes closed when path changed', async () => {
    const route1 = createRoute({ path: '/one' });
    const route2 = createRoute({ path: '/two' });

    const scope = fork();
    const history = createMemoryHistory();

    const router = createRouter({
      routes: [route1, route2],
    });

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    history.push('/one');

    await allSettled(scope);

    expect(scope.getState(router.$activeRoutes)[0]).toEqual(route1);
    expect(scope.getState(route1.$isOpened)).toBeTruthy();

    history.push('/two');

    await allSettled(scope);

    expect(scope.getState(router.$activeRoutes)[0]).toEqual(route2);
    expect(scope.getState(route2.$isOpened)).toBeTruthy();
  });

  test('routes changed path when opened', async () => {
    const route1 = createRoute({ path: '/one' });
    const route2 = createRoute({ path: '/two/:id' });
    const nested = createRoute({ parent: route1, path: '/nested/:id' });

    const scope = fork();
    const history = createMemoryHistory();

    const router = createRouter({
      routes: [route1, route2, nested],
    });

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });
    await allSettled(route1.open, { scope, params: {} });

    expect(history.location.pathname).toBe('/one');

    await allSettled(route2.open, {
      scope,
      params: { params: { id: 'hello' } },
    });

    expect(history.location.pathname).toBe('/two/hello');

    await allSettled(nested.open, {
      scope,
      params: { params: { id: 'hello' } },
    });

    expect(history.location.pathname).toBe('/one/nested/hello');
  });

  test('navigate with query', async () => {
    const scope = fork();
    const route = createRoute({ path: '/auth' });
    const router = createRouter({
      routes: [route],
    });

    const history = createMemoryHistory();

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    history.push('/auth?login=movpushmov&password=123&retry=1&retry=1');

    await vi.waitFor(
      () => expect(scope.getState(router.$activeRoutes)[0]).toEqual(route),
      { timeout: 100 },
    );

    expect(scope.getState(router.$query)).toStrictEqual({
      login: 'movpushmov',
      password: '123',
      retry: ['1', '1'],
    });
  });

  test('route.open with query', async () => {
    const scope = fork();
    const route = createRoute({ path: '/auth' });
    const router = createRouter({
      routes: [route],
    });

    const history = createMemoryHistory();

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });
    await allSettled(route.open, {
      scope,
      params: {
        query: { login: 'movpushmov', password: '123', retry: ['1', '1'] },
      },
    });

    expect(history.location.pathname).toBe('/auth');
    expect(history.location.search).toBe(
      '?login=movpushmov&password=123&retry=1&retry=1',
    );
  });

  test('navigate with params', async () => {});

  test('route.open with params', async () => {});

  test('route not opened when history blocked', async () => {
    const scope = fork();
    const route1 = createRoute({ path: '/step1' });
    const route2 = createRoute({ path: '/step2' });

    const router = createRouter({ routes: [route1, route2] });
    const history = createMemoryHistory({ initialEntries: ['/step1'] });

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    history.block(() => false);
    await allSettled(route2.open, { scope, params: {} });

    expect(scope.getState(router.$activeRoutes)[0]).toEqual(route1);
    expect(scope.getState(route1.$isOpened)).toBeTruthy();
    expect(scope.getState(route2.$isOpened)).toBeFalsy();
  });

  test('beforeOpen on route', async () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const scope = fork();

    const route1 = createRoute({
      path: '/step1',
      beforeOpen: [createEffect(fn1)],
    });

    const route2 = createRoute({
      path: '/step2',
      beforeOpen: [createEffect(fn2)],
    });

    const router = createRouter({ routes: [route1, route2] });
    const history = createMemoryHistory({ initialEntries: ['/step1'] });

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    expect(fn1).toBeCalled();

    history.push('/step2');
    await allSettled(scope);

    expect(fn2).toBeCalled();
  });

  test('parent route is opened', async () => {
    const scope = fork();

    const parent = createRoute({ path: '/parent' });
    const child = createRoute({ path: '/child', parent });

    const router = createRouter({ routes: [parent, child] });
    const history = createMemoryHistory();

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    history.push('/parent/child');
    await allSettled(scope);

    expect(scope.getState(parent.$isOpened)).toBeTruthy();
    expect(scope.getState(child.$isOpened)).toBeTruthy();
  });

  test('subrouter', async () => {
    const scope = fork();

    const settingsModalRoutes = {
      general: createRoute({ path: '/' }),
      security: createRoute({ path: '/security' }),
    };

    const settingsModalRouter = createRouter({
      base: '/settings',
      routes: [settingsModalRoutes.general, settingsModalRoutes.security],
    });

    const mainRoutes = {
      home: createRoute({ path: '/' }),
    };

    const mainRouter = createRouter({
      routes: [mainRoutes.home, settingsModalRouter],
    });

    await allSettled(mainRouter.setHistory, {
      scope,
      params: historyAdapter(createMemoryHistory()),
    });

    await allSettled(mainRoutes.home.open, { scope, params: {} });

    expect(scope.getState(mainRoutes.home.$isOpened)).toBeTrueWithMessage(
      'home route should be opened',
    );
    expect(
      scope.getState(settingsModalRoutes.general.$isOpened),
    ).toBeFalseWithMessage('settings modal general route should be closed');

    await allSettled(settingsModalRoutes.general.open, { scope, params: {} });

    expect(scope.getState(mainRoutes.home.$isOpened)).toBeFalseWithMessage(
      'home route should be closed',
    );
    expect(
      scope.getState(settingsModalRoutes.general.$isOpened),
    ).toBeTrueWithMessage('settings modal general route should be opened');

    await allSettled(settingsModalRoutes.security.open, { scope, params: {} });

    expect(scope.getState(mainRoutes.home.$isOpened)).toBeFalseWithMessage(
      'home route should be closed',
    );
    expect(
      scope.getState(settingsModalRoutes.general.$isOpened),
    ).toBeFalseWithMessage('settings modal general route should be closed');
    expect(
      scope.getState(settingsModalRoutes.security.$isOpened),
    ).toBeTrueWithMessage('settings modal security route should be opened');
  });
});
