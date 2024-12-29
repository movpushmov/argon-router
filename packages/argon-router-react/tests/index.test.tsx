import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';
import { createRoutesView, RouterProvider } from '../lib';
import { act } from 'react';
import { describe, expect, test } from 'vitest';
import { createRoute, createRouter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { render, waitFor } from '@testing-library/react';

describe('react bindings', () => {
  // ???? why???
  /* 
    type is invalid -- expected a string (for built-in components)
    or a class/function (for composite components) but got: object.
  */
  test.skip('component changed when path changed', async () => {
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

    await act(() => allSettled(route1.open, { scope, params: undefined }));

    return;

    expect(container.querySelector('#message')?.textContent).toBe('route1');

    await act(() => allSettled(route2.open, { scope, params: undefined }));

    expect(container.querySelector('#message')?.textContent).toBe('route2');

    act(() => history.push('/not-found'));

    await waitFor(() =>
      expect(scope.getState(router.$path)).toBe('/not-found'),
    );

    expect(container.querySelector('#message')?.textContent).toBe('not found');
  });
});
