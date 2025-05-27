import { allSettled, createEvent, createStore, fork, sample } from 'effector';
import { Provider } from 'effector-react';
import { createRoutesView, Link, RouterProvider } from '../lib';
import { act } from 'react';
import { describe, expect, test } from 'vitest';
import { chainRoute, createRoute, createRouter } from '@argon-router/core';
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

  test('chained route', async () => {
    interface User {
      id: number;
      name: string;
    }

    const authRoute = createRoute({ path: '/auth' });
    const profileRoute = createRoute({ path: '/profile' });

    const $user = createStore<User | null>({ id: 1, name: 'edward' });

    const authorizationCheckStarted = createEvent('check started');

    const authorized = createEvent('authorized');
    const rejected = createEvent('rejected');

    sample({
      clock: authorizationCheckStarted,
      source: $user,
      filter: Boolean,
      target: authorized,
    });

    sample({
      clock: authorizationCheckStarted,
      source: $user,
      filter: (user) => !user,
      target: rejected,
    });

    const chainedRoute = chainRoute({
      route: authRoute,
      beforeOpen: authorizationCheckStarted,
      openOn: rejected,
      cancelOn: authorized,
    });

    sample({
      clock: chainedRoute.cancelled,
      target: profileRoute.open,
    });

    const scope = fork();
    const router = createRouter({ routes: [authRoute, profileRoute] });

    const history = createMemoryHistory();

    history.push('/app');

    await allSettled(router.setHistory, { scope, params: history });

    const RoutesView = createRoutesView({
      routes: [
        {
          route: chainedRoute,
          view: () => <p data-testid="message">auth</p>,
        },
        {
          route: profileRoute,
          view: () => <p data-testid="message">profile</p>,
        },
      ],
      otherwise: () => <p data-testid="message">not found</p>,
    });

    const { getByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    await allSettled(authRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('profile'),
    );

    expect(getByTestId('message').textContent).toBe('profile');

    await allSettled($user, { scope, params: null });
    await allSettled(authRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('auth'),
    );

    expect(getByTestId('message').textContent).toBe('auth');
  });

  test('nested routes', async () => {
    const profileRoute = createRoute({ path: '/profile' });
    const friendsRoute = createRoute({
      path: '/friends',
      parent: profileRoute,
    });

    const scope = fork();
    const router = createRouter({ routes: [friendsRoute, profileRoute] });

    const history = createMemoryHistory();

    history.push('/app');

    await allSettled(router.setHistory, { scope, params: history });

    const RoutesView = createRoutesView({
      routes: [
        {
          route: friendsRoute,
          view: () => <p data-testid="message">friends</p>,
        },
        {
          route: profileRoute,
          view: () => <p data-testid="message">profile</p>,
        },
      ],
      otherwise: () => <p data-testid="message">not found</p>,
    });

    const { getByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    await allSettled(friendsRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('friends'),
    );

    expect(getByTestId('message').textContent).toBe('friends');

    await allSettled(profileRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('profile'),
    );

    expect(getByTestId('message').textContent).toBe('profile');
  });
});
