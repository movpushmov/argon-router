import {
  allSettled,
  createEvent,
  createStore,
  fork,
  sample,
  Scope,
} from 'effector';
import {
  createRoutesView,
  createRouteView,
  Link,
  RouterInjectionKey,
  withLayout,
} from '../lib';
import { describe, expect, test } from 'vitest';
import { chainRoute, createRoute, createRouter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { userEvent } from '@testing-library/user-event';

import { mount } from '@vue/test-utils';
import { defineComponent, h, Plugin } from 'vue';
import { waitFor } from '@testing-library/dom';

export interface EffectorScopePluginOptions {
  scope: Scope;
  scopeName?: string;
}

function EffectorScopePlugin(options: {
  scope: Scope;
  scopeName?: string;
}): Plugin {
  return {
    install(app) {
      app.config.globalProperties.scopeName = 'root';
      app.provide(app.config.globalProperties.scopeName, options.scope);
    },
  };
}

describe('vue bindings', () => {
  test.only('component changed when path changed', async () => {
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

    const wrapper = mount(RoutesView, {
      slots: {
        default: RoutesView,
      },
      global: {
        provide: {
          [RouterInjectionKey]: router,
        },
        plugins: [
          EffectorScopePlugin({
            scope,
          }),
        ],
      },
    });

    console.log(wrapper.html());

    await allSettled(route1.open, { scope, params: undefined });

    expect(wrapper.find('#message').element.textContent).toBe('route1');

    await allSettled(route2.open, { scope, params: undefined });

    expect(wrapper.find('#message').element.textContent).toBe('route2');

    history.push('/not-found');

    await waitFor(() =>
      expect(scope.getState(router.$path)).toBe('/not-found'),
    );

    expect(wrapper.find('#message').element.textContent).toBe('not found');
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
          view: () =>
            h(
              Link,
              { params: { id: '123' }, to: route2, id: 'link' },
              'route1',
            ),
        },
        {
          route: route2,
          view: () => h(Link, { to: route1, id: 'link' }, 'route2'),
        },
      ],
      otherwise: () => <p id="message">not found</p>,
    });

    const wrapper = mount(RouterProvider, {
      props: {
        router,
      },
      slots: {
        default: RoutesView,
      },
      global: {
        plugins: [
          EffectorScopePlugin({
            scope,
          }),
        ],
      },
    });

    await userEvent.click(wrapper.find('#link').element);

    await allSettled(scope);

    expect(scope.getState(route2.$isOpened)).toBeTruthy();
    expect(scope.getState(route2.$params)).toStrictEqual({ id: '123' });

    await userEvent.click(wrapper.find('#link').element);

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

    const wrapper = mount(RouterProvider, {
      props: {
        router,
      },
      slots: {
        default: RoutesView,
      },
      global: {
        plugins: [
          EffectorScopePlugin({
            scope,
          }),
        ],
      },
    });

    await allSettled(authRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="message"').element.textContent).toBe(
        'profile',
      ),
    );

    expect(wrapper.find('[data-testid="message"').element.textContent).toBe(
      'profile',
    );

    await allSettled($user, { scope, params: null });
    await allSettled(authRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="message"').element.textContent).toBe(
        'auth',
      ),
    );

    expect(wrapper.find('[data-testid="message"').element.textContent).toBe(
      'auth',
    );
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

    const wrapper = mount(RouterProvider, {
      props: {
        router,
      },
      slots: {
        default: RoutesView,
      },
      global: {
        plugins: [
          EffectorScopePlugin({
            scope,
          }),
        ],
      },
    });

    await allSettled(friendsRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="message"]').element.textContent).toBe(
        'friends',
      ),
    );

    expect(wrapper.find('[data-testid="message"]').element.textContent).toBe(
      'friends',
    );

    await allSettled(profileRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="message"]').element.textContent).toBe(
        'profile',
      ),
    );

    expect(wrapper.find('[data-testid="message"]').element.textContent).toBe(
      'profile',
    );
  });

  test('with layout', async () => {
    const profileRoute = createRoute({ path: '/profile' });
    const friendsRoute = createRoute({
      path: '/friends',
      parent: profileRoute,
    });

    const authRoute = createRoute({ path: '/auth' });

    const scope = fork();
    const router = createRouter({
      routes: [friendsRoute, profileRoute, authRoute],
    });

    const history = createMemoryHistory();

    history.push('/auth');

    await allSettled(router.setHistory, { scope, params: history });

    const ProfileLayout = defineComponent({
      setup(_, { slots }) {
        return (
          <>
            <p data-testid="layout">layout!</p>
            {slots}
          </>
        );
      },
    });

    const RoutesView = createRoutesView({
      routes: [
        ...withLayout(ProfileLayout, [
          createRouteView({
            route: friendsRoute,
            view: () => <p id="message">friends</p>,
          }),
          createRouteView({
            route: profileRoute,
            view: () => <p id="message">profile</p>,
          }),
        ]),
        createRouteView({
          route: authRoute,
          view: () => <p data-testid="message">auth</p>,
        }),
      ],
      otherwise: () => <p data-testid="message">not found</p>,
    });

    const wrapper = mount(RouterProvider, {
      props: {
        router,
      },
      slots: {
        default: RoutesView,
      },
      global: {
        plugins: [
          EffectorScopePlugin({
            scope,
          }),
        ],
      },
    });

    await allSettled(friendsRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(wrapper.find('data-testid=layout').element.textContent).toBe(
        'layout!',
      ),
    );

    expect(wrapper.find('[data-testid="layout"]').element.textContent).toBe(
      'layout!',
    );
    expect(wrapper.find('[data-testid="message"]').element.textContent).toBe(
      'friends',
    );

    await allSettled(profileRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="layout"]').element.textContent).toBe(
        'layout!',
      ),
    );

    expect(wrapper.find('[data-testid="layout"]').element.textContent).toBe(
      'layout!',
    );
    expect(wrapper.find('[data-testid="message"]').element.textContent).toBe(
      'profile',
    );

    await allSettled(authRoute.open, { scope, params: undefined });

    await waitFor(() =>
      expect(wrapper.find('[data-testid="layout"]').element).toBeFalsy(),
    );

    expect(wrapper.find('[data-testid="layout"]').element).toBeFalsy();
    expect(wrapper.find('[data-testid="message"]').element.textContent).toBe(
      'auth',
    );
  });
});
