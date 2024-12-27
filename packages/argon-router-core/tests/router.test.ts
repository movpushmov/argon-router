import { allSettled, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';
import { createRoute, createRouter } from '../lib';
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

    await allSettled(router.setHistory, { scope, params: history });

    history.push('/one');

    await vi.waitFor(
      () => expect(scope.getState(router.$activeRoutes)[0]).toEqual(route1),
      { timeout: 100 },
    );

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

    await allSettled(router.setHistory, { scope, params: history });

    history.push('/one');

    await vi.waitFor(
      () => expect(scope.getState(router.$activeRoutes)[0]).toEqual(route1),
      { timeout: 100 },
    );

    expect(scope.getState(router.$activeRoutes)).toStrictEqual([route1]);
    expect(scope.getState(route1.$isOpened)).toBeTruthy();

    history.push('/two');

    await vi.waitFor(
      () => expect(scope.getState(router.$activeRoutes)[0]).toEqual(route2),
      { timeout: 100 },
    );

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

    await allSettled(router.setHistory, { scope, params: history });
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

    await allSettled(router.setHistory, { scope, params: history });

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

  test.only('route.open with query', async () => {
    const scope = fork();
    const route = createRoute({ path: '/auth' });
    const router = createRouter({
      routes: [route],
    });

    const history = createMemoryHistory();

    await allSettled(router.setHistory, { scope, params: history });
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
});
