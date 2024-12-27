import { Router } from '@argon-router/core';
import { allSettled, fork, Scope } from 'effector';
import { Provider } from 'effector-react';
import { createRoutesView, RouterProvider } from '../lib';
import { act, createElement, FC } from 'react';
import { describe, expect, test } from 'vitest';
import { createRoute, createRouter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { render, waitFor } from '@testing-library/react';

function componentFabric(scope: Scope, router: Router, routesView: FC) {
  const View = routesView;

  return () => {
    return (
      <Provider value={scope}>
        <RouterProvider router={router}>
          <View />
        </RouterProvider>
      </Provider>
    );
  };
}

describe('react bindings', () => {
  test('component changed when path changed', async () => {
    const route1 = createRoute({ path: '/app' });
    const route2 = createRoute({ path: '/faq' });

    const scope = fork();
    const router = createRouter({ routes: [route1, route2] });

    const history = createMemoryHistory();

    await allSettled(router.setHistory, { scope, params: history });

    const RoutesView = createRoutesView({
      routes: [
        { route: route1, view: () => <p id="message">route1</p> },
        { route: route2, view: () => <p id="message">route2</p> },
      ],
      otherwise: () => <p id="message">not found</p>,
    });

    const { container } = render(
      createElement(componentFabric(scope, router, RoutesView)),
    );

    await act(async () => {
      await allSettled(route1.open, { scope, params: undefined });
    });

    expect(container.querySelector('#message')?.textContent).toBe('route1');

    await act(async () => {
      await allSettled(route2.open, { scope, params: undefined });
    });

    expect(container.querySelector('#message')?.textContent).toBe('route2');

    history.push('/not-found');

    await waitFor(() =>
      expect(scope.getState(router.$path)).toBe('/not-found'),
    );

    expect(container.querySelector('#message')?.textContent).toBe('not found');
  });
});
