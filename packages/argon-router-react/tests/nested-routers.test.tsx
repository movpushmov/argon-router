import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';
import { createRoutesView, RouterProvider } from '../lib';
import { describe, expect, test } from 'vitest';
import { createRoute, createRouter, historyAdapter } from '@argon-router/core';
import { createMemoryHistory } from 'history';
import { render, waitFor } from '@testing-library/react';

describe('Nested Routers', () => {
  test('basic nested router functionality', async () => {
    const scope = fork();

    // Create shop router (nested)
    const shopRoutes = {
      products: createRoute({ path: '/products' }),
      cart: createRoute({ path: '/cart' }),
    };

    const shopRouter = createRouter({
      routes: [shopRoutes.products, shopRoutes.cart],
    });

    // Create main router
    const mainRoutes = {
      home: createRoute({ path: '/' }),
      settings: createRoute({ path: '/settings' }),
    };

    const mainRouter = createRouter({
      routes: [mainRoutes.home, mainRoutes.settings, shopRouter],
    });

    const history = createMemoryHistory();
    history.push('/');

    await allSettled(mainRouter.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ShopRoutesView = createRoutesView({
      routes: [
        {
          route: shopRoutes.products,
          view: () => <p data-testid="message">products</p>,
        },
        {
          route: shopRoutes.cart,
          view: () => <p data-testid="message">cart</p>,
        },
      ],
    });

    const MainRoutesView = createRoutesView({
      routes: [
        {
          route: mainRoutes.home,
          view: () => <p data-testid="message">home</p>,
        },
        {
          route: mainRoutes.settings,
          view: () => <p data-testid="message">settings</p>,
        },
        {
          route: shopRouter,
          view: ShopRoutesView,
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

    // Initial state - home
    expect(getByTestId('message').textContent).toBe('home');

    // Navigate to products (nested router)
    await allSettled(shopRoutes.products.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('products'),
    );

    expect(getByTestId('message').textContent).toBe('products');
    expect(scope.getState(shopRoutes.products.$isOpened)).toBeTruthy();

    // Navigate to cart (nested router)
    await allSettled(shopRoutes.cart.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('cart'),
    );

    expect(getByTestId('message').textContent).toBe('cart');
    expect(scope.getState(shopRoutes.cart.$isOpened)).toBeTruthy();

    // Navigate to settings (main router)
    await allSettled(mainRoutes.settings.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('settings'),
    );

    expect(getByTestId('message').textContent).toBe('settings');
    expect(scope.getState(mainRoutes.settings.$isOpened)).toBeTruthy();
  });

  test('multiple nested routers at same level', async () => {
    const scope = fork();

    // Shop router
    const shopRoutes = {
      products: createRoute({ path: '/products' }),
      orders: createRoute({ path: '/orders' }),
    };

    const shopRouter = createRouter({
      routes: [shopRoutes.products, shopRoutes.orders],
    });

    // Blog router
    const blogRoutes = {
      posts: createRoute({ path: '/posts' }),
      authors: createRoute({ path: '/authors' }),
    };

    const blogRouter = createRouter({
      routes: [blogRoutes.posts, blogRoutes.authors],
    });

    // Main router
    const mainRoutes = {
      home: createRoute({ path: '/' }),
    };

    const mainRouter = createRouter({
      routes: [mainRoutes.home, shopRouter, blogRouter],
    });

    const history = createMemoryHistory();
    history.push('/');

    await allSettled(mainRouter.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ShopRoutesView = createRoutesView({
      routes: [
        {
          route: shopRoutes.products,
          view: () => <p data-testid="message">Shop - Products</p>,
        },
        {
          route: shopRoutes.orders,
          view: () => <p data-testid="message">Shop - Orders</p>,
        },
      ],
    });

    const BlogRoutesView = createRoutesView({
      routes: [
        {
          route: blogRoutes.posts,
          view: () => <p data-testid="message">Blog - Posts</p>,
        },
        {
          route: blogRoutes.authors,
          view: () => <p data-testid="message">Blog - Authors</p>,
        },
      ],
    });

    const MainRoutesView = createRoutesView({
      routes: [
        {
          route: mainRoutes.home,
          view: () => <p data-testid="message">Home</p>,
        },
        {
          route: shopRouter,
          view: ShopRoutesView,
        },
        {
          route: blogRouter,
          view: BlogRoutesView,
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

    // Home
    expect(getByTestId('message').textContent).toBe('Home');

    // Navigate to shop products
    await allSettled(shopRoutes.products.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Shop - Products'),
    );

    expect(getByTestId('message').textContent).toBe('Shop - Products');

    // Navigate to blog posts
    await allSettled(blogRoutes.posts.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Blog - Posts'),
    );

    expect(getByTestId('message').textContent).toBe('Blog - Posts');

    // Navigate to shop orders
    await allSettled(shopRoutes.orders.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Shop - Orders'),
    );

    expect(getByTestId('message').textContent).toBe('Shop - Orders');

    // Navigate to blog authors
    await allSettled(blogRoutes.authors.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Blog - Authors'),
    );

    expect(getByTestId('message').textContent).toBe('Blog - Authors');
  });

  test('nested router state isolation', async () => {
    const scope = fork();

    const moduleARoute = createRoute({ path: '/module-a' });
    const moduleBRoute = createRoute({ path: '/module-b' });

    const mainRouter = createRouter({
      routes: [moduleARoute, moduleBRoute],
    });

    const history = createMemoryHistory();
    history.push('/');

    await allSettled(mainRouter.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const MainRoutesView = createRoutesView({
      routes: [
        {
          route: moduleARoute,
          view: () => <p data-testid="message">Module A</p>,
        },
        {
          route: moduleBRoute,
          view: () => <p data-testid="message">Module B</p>,
        },
      ],
    });

    const { getByTestId, queryByTestId } = render(
      <Provider value={scope}>
        <RouterProvider router={mainRouter}>
          <MainRoutesView />
        </RouterProvider>
      </Provider>,
    );

    // No route initially
    expect(queryByTestId('message')).toBeFalsy();

    // Open Module A
    await allSettled(moduleARoute.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Module A'),
    );

    expect(scope.getState(moduleARoute.$isOpened)).toBeTruthy();
    expect(scope.getState(moduleBRoute.$isOpened)).toBeFalsy();

    // Open Module B (Module A should close)
    await allSettled(moduleBRoute.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Module B'),
    );

    expect(scope.getState(moduleARoute.$isOpened)).toBeFalsy();
    expect(scope.getState(moduleBRoute.$isOpened)).toBeTruthy();
  });

  test('nested router with route parameters', async () => {
    const scope = fork();

    const projectRoutes = {
      details: createRoute({ path: '/details' }),
      tasks: createRoute({ path: '/tasks/:taskId' }),
    };

    const projectRouter = createRouter({
      routes: [projectRoutes.details, projectRoutes.tasks],
    });

    const mainRoutes = {
      workspace: createRoute({ path: '/workspace/:workspaceId' }),
    };

    const mainRouter = createRouter({
      routes: [mainRoutes.workspace, projectRouter],
    });

    const history = createMemoryHistory();
    history.push('/workspace/ws-123');

    await allSettled(mainRouter.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ProjectRoutesView = createRoutesView({
      routes: [
        {
          route: projectRoutes.details,
          view: () => <p data-testid="message">Project Details</p>,
        },
        {
          route: projectRoutes.tasks,
          view: () => <p data-testid="message">Task View</p>,
        },
      ],
    });

    const MainRoutesView = createRoutesView({
      routes: [
        {
          route: mainRoutes.workspace,
          view: () => <p data-testid="message">Workspace</p>,
        },
        {
          route: projectRouter,
          view: ProjectRoutesView,
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

    // Initial workspace with params
    expect(getByTestId('message').textContent).toBe('Workspace');
    expect(scope.getState(mainRoutes.workspace.$params)).toEqual({
      workspaceId: 'ws-123',
    });

    // Navigate to nested router route with params
    await allSettled(projectRoutes.tasks.open, {
      scope,
      params: { params: { taskId: 'task-456' } },
    });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Task View'),
    );

    expect(getByTestId('message').textContent).toBe('Task View');
    expect(scope.getState(projectRoutes.tasks.$params)).toEqual({
      taskId: 'task-456',
    });

    // Navigate to details
    await allSettled(projectRoutes.details.open, {
      scope,
      params: undefined,
    });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Project Details'),
    );

    expect(getByTestId('message').textContent).toBe('Project Details');
  });

  test('nested router isolated state management', async () => {
    const scope = fork();

    const moduleARoutes = {
      page1: createRoute({ path: '/module-a/page1' }),
      page2: createRoute({ path: '/module-a/page2' }),
    };

    const moduleARouter = createRouter({
      routes: [moduleARoutes.page1, moduleARoutes.page2],
    });

    const moduleBRoutes = {
      page1: createRoute({ path: '/module-b/page1' }),
      page2: createRoute({ path: '/module-b/page2' }),
    };

    const moduleBRouter = createRouter({
      routes: [moduleBRoutes.page1, moduleBRoutes.page2],
    });

    const mainRouter = createRouter({
      routes: [moduleARouter, moduleBRouter],
    });

    const history = createMemoryHistory();
    history.push('/');

    await allSettled(mainRouter.setHistory, {
      scope,
      params: historyAdapter(history),
    });

    const ModuleARoutesView = createRoutesView({
      routes: [
        {
          route: moduleARoutes.page1,
          view: () => <p data-testid="message">Module A - Page 1</p>,
        },
        {
          route: moduleARoutes.page2,
          view: () => <p data-testid="message">Module A - Page 2</p>,
        },
      ],
    });

    const ModuleBRoutesView = createRoutesView({
      routes: [
        {
          route: moduleBRoutes.page1,
          view: () => <p data-testid="message">Module B - Page 1</p>,
        },
        {
          route: moduleBRoutes.page2,
          view: () => <p data-testid="message">Module B - Page 2</p>,
        },
      ],
    });

    const MainRoutesView = createRoutesView({
      routes: [
        {
          route: moduleARouter,
          view: ModuleARoutesView,
        },
        {
          route: moduleBRouter,
          view: ModuleBRoutesView,
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

    // Open Module A Page 1
    await allSettled(moduleARoutes.page1.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Module A - Page 1'),
    );

    expect(scope.getState(moduleARoutes.page1.$isOpened)).toBeTruthy();
    expect(scope.getState(moduleBRoutes.page1.$isOpened)).toBeFalsy();

    // Open Module B Page 1 (Module A should close)
    await allSettled(moduleBRoutes.page1.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Module B - Page 1'),
    );

    expect(scope.getState(moduleARoutes.page1.$isOpened)).toBeFalsy();
    expect(scope.getState(moduleBRoutes.page1.$isOpened)).toBeTruthy();

    // Open Module A Page 2
    await allSettled(moduleARoutes.page2.open, { scope, params: undefined });
    await waitFor(() =>
      expect(getByTestId('message').textContent).toBe('Module A - Page 2'),
    );

    expect(scope.getState(moduleARoutes.page2.$isOpened)).toBeTruthy();
    expect(scope.getState(moduleBRoutes.page1.$isOpened)).toBeFalsy();
  });
});
