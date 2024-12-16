import { describe, expect, test } from 'vitest';
import { createRoute, createRouter } from '../lib';

describe('paths generation', () => {
  test('without base', async () => {
    const route1 = createRoute({ path: '/hi' });
    const route2 = createRoute({ path: '/hello' });
    const nested1 = createRoute({ path: '/ff', parent: route1 });
    const nested2 = createRoute({ path: '/ss', parent: route2 });
    const nested3 = createRoute({ path: '/ss', parent: nested1 });

    const { mappedRoutes } = createRouter({
      routes: [route1, route2, nested1, nested2, nested3],
    });

    expect(mappedRoutes.map((route) => route.path)).toStrictEqual([
      '/hi',
      '/hello',
      '/hi/ff',
      '/hello/ss',
      '/hi/ff/ss',
    ]);
  });

  test('with base', async () => {
    const route1 = createRoute({ path: '/hi' });
    const route2 = createRoute({ path: '/hello' });
    const nested1 = createRoute({ path: '/ff', parent: route1 });
    const nested2 = createRoute({ path: '/ss', parent: route2 });
    const nested3 = createRoute({ path: '/ss', parent: nested1 });

    const { mappedRoutes } = createRouter({
      base: '/movpushmov',
      routes: [route1, route2, nested1, nested2, nested3],
    });

    expect(mappedRoutes.map((route) => route.path)).toStrictEqual([
      '/movpushmov/hi',
      '/movpushmov/hello',
      '/movpushmov/hi/ff',
      '/movpushmov/hello/ss',
      '/movpushmov/hi/ff/ss',
    ]);
  });
});
