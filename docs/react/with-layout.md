# withLayout

Utility function to wrap multiple route views with a shared layout component.

## Import

```ts
import { withLayout } from '@argon-router/react';
```

## Usage

```tsx
import { withLayout, createRouteView, createRoutesView } from '@argon-router/react';
import { MainLayout } from './layouts';

function MainLayout({ children }) {
  return (
    <div>
      <header>Header</header>
      <main>{children}</main>
      <footer>Footer</footer>
    </div>
  );
}

const RoutesView = createRoutesView({
  routes: [
    ...withLayout(MainLayout, [
      createRouteView({ route: homeRoute, view: HomeComponent }),
      createRouteView({ route: aboutRoute, view: AboutComponent }),
      createRouteView({ route: contactRoute, view: ContactComponent }),
    ]),
    // Routes without layout
    createRouteView({ route: loginRoute, view: LoginComponent }),
  ],
});
```

## Multiple Layouts

Apply different layouts to different route groups:

```tsx
import { MainLayout, AdminLayout, AuthLayout } from './layouts';

const RoutesView = createRoutesView({
  routes: [
    ...withLayout(MainLayout, [
      createRouteView({ route: homeRoute, view: HomeComponent }),
      createRouteView({ route: aboutRoute, view: AboutComponent }),
    ]),
    ...withLayout(AdminLayout, [
      createRouteView({ route: dashboardRoute, view: DashboardComponent }),
      createRouteView({ route: usersRoute, view: UsersComponent }),
    ]),
    ...withLayout(AuthLayout, [
      createRouteView({ route: loginRoute, view: LoginComponent }),
      createRouteView({ route: signupRoute, view: SignupComponent }),
    ]),
  ],
});
```

## Parameters

### `layout` (required)

Layout component that accepts `children` prop:

```tsx
import { type ReactNode } from 'react';

function MyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}

withLayout(MyLayout, routes);
```

### `views` (required)

Array of route views created with `createRouteView` or `createLazyRouteView`:

```tsx
withLayout(MainLayout, [
  createRouteView({ route: homeRoute, view: HomeComponent }),
  createLazyRouteView({ route: profileRoute, view: () => import('./Profile') }),
]);
```

## Return Value

Returns an array of route views with the layout applied:

```tsx
const wrappedRoutes = withLayout(MainLayout, [
  createRouteView({ route: homeRoute, view: HomeComponent }),
]);

// Returns:
// [
//   {
//     route: homeRoute,
//     view: () => <MainLayout><HomeComponent /></MainLayout>
//   }
// ]
```

## Nested Layouts

Layouts can be nested by applying `withLayout` multiple times:

```tsx
function OuterLayout({ children }) {
  return (
    <div className="outer">
      <nav>Main Navigation</nav>
      {children}
    </div>
  );
}

function InnerLayout({ children }) {
  return (
    <div className="inner">
      <aside>Sidebar</aside>
      {children}
    </div>
  );
}

const RoutesView = createRoutesView({
  routes: withLayout(OuterLayout, [
    createRouteView({ route: homeRoute, view: HomeComponent }),
    ...withLayout(InnerLayout, [
      createRouteView({ route: dashboardRoute, view: DashboardComponent }),
      createRouteView({ route: settingsRoute, view: SettingsComponent }),
    ]),
  ]),
});
```

## Alternative: Layout in Route View

You can also specify layout directly in `createRouteView`:

```tsx
// Using withLayout
withLayout(MainLayout, [
  createRouteView({ route: homeRoute, view: HomeComponent }),
]);

// Same as:
createRouteView({
  route: homeRoute,
  view: HomeComponent,
  layout: MainLayout,
});
```

**Use `withLayout` when:**
- Multiple routes share the same layout
- You want to group routes visually in code
- You need to apply layouts conditionally

**Use `layout` prop when:**
- Only one route uses the layout
- Each route has a different layout
- Layout is closely tied to the specific route

## See Also

- [createRouteView](./create-route-view) - Create route views (with layout prop)
- [createLazyRouteView](./create-lazy-route-view) - Lazy-loaded route views
- [createRoutesView](./create-routes-view) - Render active routes
