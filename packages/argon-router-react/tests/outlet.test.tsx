import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';
import { createRoutesView, Outlet, RouterProvider } from '../lib';
import { describe, expect, test } from 'vitest';
import { createRoute, createRouter, historyAdapter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { render, waitFor } from '@testing-library/react';

describe('Outlet Component', () => {
  test('renders child route in outlet', async () => {
    const profileRoute = createRoute({ path: '/profile' });
    const settingsRoute = createRoute({
      path: '/settings',
      parent: profileRoute,
    });

    const scope = fork();
    const router = createRouter({ routes: [profileRoute, settingsRoute] });

    const history = createMemoryHistory();
    history.push('/profile');

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ProfileView = () => (
      <div>
        <h1 data-testid="profile">Profile</h1>
        <Outlet />
      </div>
    );

    const SettingsView = () => <p data-testid="settings">Settings</p>;

    const RoutesView = createRoutesView({
      routes: [
        {
          route: profileRoute,
          view: ProfileView,
          children: [
            {
              route: settingsRoute,
              view: SettingsView,
            },
          ],
        },
      ],
    });

    const { getByTestId, queryByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    // Initially only profile should be visible
    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(queryByTestId('settings')).toBeFalsy();

    // Open settings route
    await allSettled(settingsRoute.open, { scope, params: undefined });

    await waitFor(() => expect(getByTestId('settings')).toBeTruthy());

    // Both profile and settings should be visible
    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(getByTestId('settings').textContent).toBe('Settings');
  });

  test('outlet renders nothing when no child route is active', async () => {
    const profileRoute = createRoute({ path: '/profile' });
    const settingsRoute = createRoute({
      path: '/settings',
      parent: profileRoute,
    });

    const scope = fork();
    const router = createRouter({ routes: [profileRoute, settingsRoute] });

    const history = createMemoryHistory();
    history.push('/profile');

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ProfileView = () => (
      <div>
        <h1 data-testid="profile">Profile</h1>
        <div data-testid="outlet-container">
          <Outlet />
        </div>
      </div>
    );

    const SettingsView = () => <p data-testid="settings">Settings</p>;

    const RoutesView = createRoutesView({
      routes: [
        {
          route: profileRoute,
          view: ProfileView,
          children: [
            {
              route: settingsRoute,
              view: SettingsView,
            },
          ],
        },
      ],
    });

    const { getByTestId, queryByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    // Outlet should be empty when no child is active
    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(getByTestId('outlet-container').children.length).toBe(0);
    expect(queryByTestId('settings')).toBeFalsy();
  });

  test('outlet switches between sibling routes', async () => {
    const profileRoute = createRoute({ path: '/profile' });
    const settingsRoute = createRoute({
      path: '/settings',
      parent: profileRoute,
    });
    const notificationsRoute = createRoute({
      path: '/notifications',
      parent: profileRoute,
    });

    const scope = fork();
    const router = createRouter({
      routes: [profileRoute, settingsRoute, notificationsRoute],
    });

    const history = createMemoryHistory();
    history.push('/profile');

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ProfileView = () => (
      <div>
        <h1 data-testid="profile">Profile</h1>
        <Outlet />
      </div>
    );

    const SettingsView = () => <p data-testid="settings">Settings</p>;
    const NotificationsView = () => (
      <p data-testid="notifications">Notifications</p>
    );

    const RoutesView = createRoutesView({
      routes: [
        {
          route: profileRoute,
          view: ProfileView,
          children: [
            {
              route: settingsRoute,
              view: SettingsView,
            },
            {
              route: notificationsRoute,
              view: NotificationsView,
            },
          ],
        },
      ],
    });

    const { getByTestId, queryByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    // Open settings
    await allSettled(settingsRoute.open, { scope, params: undefined });
    await waitFor(() => expect(getByTestId('settings')).toBeTruthy());

    expect(getByTestId('settings').textContent).toBe('Settings');
    expect(queryByTestId('notifications')).toBeFalsy();

    // Switch to notifications
    await allSettled(notificationsRoute.open, { scope, params: undefined });
    await waitFor(() => expect(getByTestId('notifications')).toBeTruthy());

    expect(getByTestId('notifications').textContent).toBe('Notifications');
    expect(queryByTestId('settings')).toBeFalsy();

    // Back to parent route
    await allSettled(profileRoute.open, { scope, params: undefined });
    await waitFor(() => expect(queryByTestId('notifications')).toBeFalsy());

    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(queryByTestId('settings')).toBeFalsy();
    expect(queryByTestId('notifications')).toBeFalsy();
  });

  test('outlet with simple nested routes', async () => {
    const dashboardRoute = createRoute({ path: '/dashboard' });
    const settingsRoute = createRoute({
      path: '/settings',
      parent: dashboardRoute,
    });

    const scope = fork();
    const router = createRouter({ routes: [dashboardRoute, settingsRoute] });

    const history = createMemoryHistory();
    history.push('/dashboard');

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const DashboardView = () => (
      <div>
        <h1 data-testid="dashboard">Dashboard</h1>
        <Outlet />
      </div>
    );

    const SettingsView = () => <p data-testid="settings">Settings Content</p>;

    const RoutesView = createRoutesView({
      routes: [
        {
          route: dashboardRoute,
          view: DashboardView,
          children: [
            {
              route: settingsRoute,
              view: SettingsView,
            },
          ],
        },
      ],
    });

    const { getByTestId, queryByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    expect(getByTestId('dashboard').textContent).toBe('Dashboard');
    expect(queryByTestId('settings')).toBeFalsy();

    // Open settings route
    await allSettled(settingsRoute.open, { scope, params: undefined });
    await waitFor(() => expect(getByTestId('settings')).toBeTruthy());

    expect(getByTestId('dashboard').textContent).toBe('Dashboard');
    expect(getByTestId('settings').textContent).toBe('Settings Content');
  });

  test('outlet with nested router', async () => {
    const scope = fork();

    const rootRoutes = {
      profile: createRoute({ path: '/profile' }),
    };

    const profileRoutes = {
      friends: createRoute({ path: '/friends', parent: rootRoutes.profile }),
      settings: createRoute({ path: '/settings', parent: rootRoutes.profile }),
    };

    const profileRouter = createRouter({
      routes: [profileRoutes.friends, profileRoutes.settings],
    });

    const router = createRouter({
      routes: [rootRoutes.profile, profileRouter],
    });

    const history = createMemoryHistory();
    history.push('/profile');

    await allSettled(router.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ProfileView = () => (
      <div>
        <h1 data-testid="profile">Profile</h1>
        <Outlet />
      </div>
    );

    const FriendsView = () => <p data-testid="friends">Friends</p>;
    const SettingsView = () => <p data-testid="settings">Settings</p>;

    const ProfileRoutesView = createRoutesView({
      routes: [
        {
          route: profileRoutes.friends,
          view: FriendsView,
        },
        {
          route: profileRoutes.settings,
          view: SettingsView,
        },
      ],
    });

    const RoutesView = createRoutesView({
      routes: [
        {
          route: rootRoutes.profile,
          view: ProfileView,
          children: [
            {
              route: profileRouter,
              view: ProfileRoutesView,
            },
          ],
        },
      ],
    });

    const { getByTestId, queryByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={router}>
          <RoutesView />
        </RouterProvider>
      </Provider>,
    );

    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(queryByTestId('friends')).toBeFalsy();
    expect(queryByTestId('settings')).toBeFalsy();

    // Open friends route
    await allSettled(profileRoutes.friends.open, { scope, params: undefined });

    await waitFor(() => expect(getByTestId('friends')).toBeTruthy());

    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(getByTestId('friends').textContent).toBe('Friends');
    expect(queryByTestId('settings')).toBeFalsy();

    // Open settings route
    await allSettled(profileRoutes.settings.open, { scope, params: undefined });
    await waitFor(() => expect(getByTestId('settings')).toBeTruthy());

    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(getByTestId('settings').textContent).toBe('Settings');
    expect(queryByTestId('friends')).toBeFalsy();

    // Back to profile route
    await allSettled(rootRoutes.profile.open, { scope, params: undefined });
    await waitFor(() => expect(queryByTestId('friends')).toBeFalsy());

    expect(getByTestId('profile').textContent).toBe('Profile');
    expect(queryByTestId('friends')).toBeFalsy();
    expect(queryByTestId('settings')).toBeFalsy();
  });
});
