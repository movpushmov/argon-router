import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';
import { createRoutesView, Link, RouterProvider } from '../lib';
import { act } from 'react';
import { describe, expect, test } from 'vitest';
import { createRoute, createRouter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

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
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    await allSettled(route1.open, { scope, params: undefined });

    expect(container.querySelector('#message')?.textContent).toBe('route1');

    await allSettled(route2.open, { scope, params: undefined });

    expect(container.querySelector('#message')?.textContent).toBe('route2');

    act(() => history.push('/not-found'));

    await waitFor(() =>
      expect(scope.getState(router.$path)).toBe('/not-found'),
    );

    expect(container.querySelector('#message')?.textContent).toBe('not found');
  });

  test('link', async () => {
    const route1 = createRoute({ path: '/app' });
    const route2 = createRoute({ path: '/faq/:id' });

    const scope = fork();
    const router = createRouter({ routes: [route1, route2] });

    const history = createMemoryHistory();

    history.push('/app');

    await allSettled(router.setHistory, { scope, params: history });

    const RoutesView = createRoutesView({
      routes: [
        {
          route: route1,
          view: () => (
            <Link params={{ id: '123' }} to={route2} id="link">
              route1
            </Link>
          ),
        },
        {
          route: route2,
          view: () => (
            <Link to={route1} id="link">
              route2
            </Link>
          ),
        },
      ],
      otherwise: () => <p id="message">not found</p>,
    });

    const { container } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    await userEvent.click(container.querySelector('#link')!);

    await allSettled(scope);

    expect(scope.getState(route2.$isOpened)).toBeTruthy();
    expect(scope.getState(route2.$params)).toStrictEqual({ id: '123' });

    await userEvent.click(container.querySelector('#link')!);

    await allSettled(scope);

    expect(scope.getState(route1.$isOpened)).toBeTruthy();
  });
});
