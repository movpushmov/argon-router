import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';
import { createRoutesView, Outlet, RouterProvider } from '../lib';
import { describe, expect, test } from 'vitest';
import { createRoute, createRouter, historyAdapter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { act, render } from '@testing-library/react';

describe('Complex Example: E-commerce App with Nested Routers and Outlets', () => {
  /**
   * This example demonstrates a realistic e-commerce application structure:
   *
   * Main Router:
   * - / (Home)
   * - /auth/* (Auth Router - Login/Register)
   * - /shop/* (Shop Router - Products/Categories)
   * - /account/* (Account Routes with nested children using Outlet)
   */
  test('complete e-commerce app structure', async () => {
    const scope = fork();

    const authRoutes = {
      login: createRoute({ path: '/login' }),
      register: createRoute({ path: '/register' }),
    };

    const authRouter = createRouter({
      routes: [authRoutes.login, authRoutes.register],
    });

    const shopRoutes = {
      products: createRoute({ path: '/products' }),
      categories: createRoute({ path: '/categories' }),
    };

    const shopRouter = createRouter({
      routes: [shopRoutes.products, shopRoutes.categories],
    });

    const accountRoutes = {
      root: createRoute({ path: '/account' }),
      profile: createRoute({ path: '/profile', parent: undefined }),
      orders: createRoute({ path: '/orders', parent: undefined }),
    };

    accountRoutes.profile = createRoute({
      path: '/profile',
      parent: accountRoutes.root,
    });
    accountRoutes.orders = createRoute({
      path: '/orders',
      parent: accountRoutes.root,
    });

    const mainRoutes = {
      home: createRoute({ path: '/' }),
    };

    const mainRouter = createRouter({
      routes: [
        mainRoutes.home,
        authRouter,
        shopRouter,
        accountRoutes.root,
        accountRoutes.profile,
        accountRoutes.orders,
      ],
    });

    const history = createMemoryHistory();
    history.push('/');

    await allSettled(mainRouter.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const AuthRoutesView = createRoutesView({
      routes: [
        {
          route: authRoutes.login,
          view: () => (
            <div>
              <h2 data-testid="auth-title">Login</h2>
            </div>
          ),
        },
        {
          route: authRoutes.register,
          view: () => (
            <div>
              <h2 data-testid="auth-title">Register</h2>
            </div>
          ),
        },
      ],
    });

    const ShopRoutesView = createRoutesView({
      routes: [
        {
          route: shopRoutes.products,
          view: () => (
            <div>
              <h3 data-testid="shop-content">Products List</h3>
            </div>
          ),
        },
        {
          route: shopRoutes.categories,
          view: () => (
            <div>
              <h3 data-testid="shop-content">Categories</h3>
            </div>
          ),
        },
      ],
    });

    const AccountLayout = () => (
      <div>
        <div data-testid="account-header">
          <h2>My Account</h2>
        </div>
        <div data-testid="account-content">
          <Outlet />
        </div>
      </div>
    );

    const MainRoutesView = createRoutesView({
      routes: [
        {
          route: mainRoutes.home,
          view: () => (
            <div>
              <h1 data-testid="page-title">Home</h1>
            </div>
          ),
        },
        {
          route: authRouter,
          view: () => (
            <div>
              <h1 data-testid="page-title">Authentication</h1>
              <AuthRoutesView />
            </div>
          ),
        },
        {
          route: shopRouter,
          view: () => (
            <div>
              <h1 data-testid="page-title">Shop</h1>
              <ShopRoutesView />
            </div>
          ),
        },
        {
          route: accountRoutes.root,
          view: AccountLayout,
          children: [
            {
              route: accountRoutes.profile,
              view: () => (
                <div data-testid="account-page">
                  <h3>Profile Settings</h3>
                  <p>Edit your profile information here</p>
                </div>
              ),
            },
            {
              route: accountRoutes.orders,
              view: () => (
                <div data-testid="account-page">
                  <h3>Order History</h3>
                  <p>View your past orders</p>
                </div>
              ),
            },
          ],
        },
      ],
    });

    const { getByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={mainRouter}>
          <MainRoutesView />
        </RouterProvider>
      </Provider>,
    );

    expect(getByTestId('page-title').textContent).toBe('Home');

    await act(() =>
      allSettled(authRoutes.login.open, { scope, params: undefined }),
    );

    expect(getByTestId('page-title').textContent).toBe('Authentication');
    expect(getByTestId('auth-title').textContent).toBe('Login');

    await act(() =>
      allSettled(authRoutes.register.open, { scope, params: undefined }),
    );

    expect(getByTestId('auth-title').textContent).toBe('Register');

    await act(() =>
      allSettled(shopRoutes.products.open, { scope, params: undefined }),
    );

    expect(getByTestId('page-title').textContent).toBe('Shop');
    expect(getByTestId('shop-content').textContent).toBe('Products List');

    await act(() =>
      allSettled(shopRoutes.categories.open, { scope, params: undefined }),
    );

    expect(getByTestId('shop-content').textContent).toBe('Categories');

    await act(() =>
      allSettled(accountRoutes.profile.open, { scope, params: undefined }),
    );

    expect(getByTestId('account-header')).toBeTruthy();
    expect(getByTestId('account-header').textContent).toContain('My Account');
    expect(getByTestId('account-page').textContent).toContain(
      'Profile Settings',
    );

    await act(() =>
      allSettled(accountRoutes.orders.open, { scope, params: undefined }),
    );

    expect(getByTestId('account-page').textContent).toContain('Order History');

    await act(() =>
      allSettled(accountRoutes.profile.open, { scope, params: undefined }),
    );

    expect(getByTestId('account-page').textContent).toContain(
      'Profile Settings',
    );

    await act(() =>
      allSettled(accountRoutes.root.open, { scope, params: undefined }),
    );

    expect(getByTestId('account-header')).toBeTruthy();
    expect(getByTestId('account-content').children.length).toBe(0);
  });
});
