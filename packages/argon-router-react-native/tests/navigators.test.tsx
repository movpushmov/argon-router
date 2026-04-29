import * as React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react-native';
import { allSettled, fork, type Scope } from 'effector';
import { Provider, useUnit } from 'effector-react';
import { createMemoryHistory } from 'history';
import {
  createRoute,
  createRouter,
  historyAdapter,
  type Router,
} from '@argon-router/core';
import { RouterProvider, type RouteView } from '@argon-router/react';
import {
  createArgonBottomTabsNavigator,
  createArgonStackNavigator,
} from '../lib';

import { describe, test, expect } from 'vitest';

function renderWithNavigation(
  router: Router,
  scope: Scope,
  children: React.ReactNode,
) {
  return render(
    <Provider value={scope}>
      <RouterProvider router={router}>
        <NavigationContainer>{children}</NavigationContainer>
      </RouterProvider>
    </Provider>,
  );
}

describe('react-native navigators', () => {
  test('stack navigator follows argon route opens', async () => {
    const homeRoute = createRoute({ path: '/home' });
    const profileRoute = createRoute({ path: '/profile/:id' });
    const router = createRouter({ routes: [homeRoute, profileRoute] });
    const scope = fork();
    const history = createMemoryHistory({ initialEntries: ['/home'] });

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const routes: RouteView[] = [
      {
        route: homeRoute,
        view: () => <Text testID="home-screen">Home</Text>,
      },
      {
        route: profileRoute,
        view: () => {
          const params = useUnit(profileRoute.$params);
          return <Text testID="profile-screen">Profile {params.id}</Text>;
        },
      },
    ];

    const { Navigator } = createArgonStackNavigator({
      router,
      routes,
      initialRouteName: '/home',
      screenOptions: { animationEnabled: false, headerShown: false },
    });

    renderWithNavigation(router, scope, <Navigator />);

    expect(screen.getByTestId('home-screen')).toBeTruthy();

    await act(async () => {
      await allSettled(profileRoute.open, {
        scope,
        params: { params: { id: '42' } },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('profile-screen').props.children).toEqual([
        'Profile ',
        '42',
      ]);
    });
  });

  test('bottom tabs open argon routes on tab press', async () => {
    const homeRoute = createRoute({ path: '/home' });
    const searchRoute = createRoute({ path: '/search' });
    const router = createRouter({ routes: [homeRoute, searchRoute] });
    const scope = fork();
    const history = createMemoryHistory({ initialEntries: ['/home'] });

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const routes: RouteView[] = [
      {
        route: homeRoute,
        view: () => <Text testID="home-tab-screen">Home</Text>,
      },
      {
        route: searchRoute,
        view: () => <Text testID="search-tab-screen">Search</Text>,
      },
    ];

    const { Navigator } = createArgonBottomTabsNavigator({
      router,
      routes,
      initialRouteName: 'home',
      screenOptions: {
        animation: 'none',
      },
    });

    renderWithNavigation(router, scope, <Navigator />);

    expect(screen.getByTestId('home-tab-screen')).toBeTruthy();

    fireEvent.press(screen.getByText('search'));

    await waitFor(() => {
      expect(scope.getState(searchRoute.$isOpened)).toBe(true);
      expect(screen.getByTestId('search-tab-screen')).toBeTruthy();
    });
  });
});
