# Outlet

Component for rendering nested child routes within a parent route.

## Import

```ts
import { Outlet } from '@argon-router/react';
```

## Usage

```tsx
import { Outlet } from '@argon-router/react';
import { createRouteView, createRoutesView } from '@argon-router/react';

// Parent component with Outlet
function ProfileComponent() {
  return (
    <div>
      <h1>Profile</h1>
      <nav>
        <Link to={settingsRoute}>Settings</Link>
        <Link to={friendsRoute}>Friends</Link>
      </nav>
      <Outlet /> {/* Renders active child route */}
    </div>
  );
}

// Create route structure with children
const ProfileScreen = createRouteView({
  route: profileRoute,
  view: ProfileComponent,
  children: [
    createRouteView({ route: settingsRoute, view: SettingsComponent }),
    createRouteView({ route: friendsRoute, view: FriendsComponent }),
  ],
});

const RoutesView = createRoutesView({
  routes: [ProfileScreen],
});
```

## How It Works

1. Parent route defines `children` in its route view
2. Parent component renders `<Outlet />` where children should appear
3. When a child route is active, `Outlet` renders that child's component
4. When no child route is active, `Outlet` renders nothing

## Nested Navigation

```tsx
import { Outlet, Link } from '@argon-router/react';

function DashboardComponent() {
  return (
    <div className="dashboard">
      <aside>
        <nav>
          <Link to={overviewRoute}>Overview</Link>
          <Link to={analyticsRoute}>Analytics</Link>
          <Link to={reportsRoute}>Reports</Link>
        </nav>
      </aside>
      <main>
        <Outlet /> {/* Renders Overview, Analytics, or Reports */}
      </main>
    </div>
  );
}

const DashboardScreen = createRouteView({
  route: dashboardRoute,
  view: DashboardComponent,
  children: [
    createRouteView({ route: overviewRoute, view: OverviewComponent }),
    createRouteView({ route: analyticsRoute, view: AnalyticsComponent }),
    createRouteView({ route: reportsRoute, view: ReportsComponent }),
  ],
});
```

## Multiple Levels

Outlets can be nested multiple levels deep:

```tsx
// Level 1: App Layout
function AppLayout() {
  return (
    <div>
      <Header />
      <Outlet /> {/* Renders Dashboard or other top-level routes */}
    </div>
  );
}

// Level 2: Dashboard
function DashboardComponent() {
  return (
    <div>
      <DashboardNav />
      <Outlet /> {/* Renders Analytics or Reports */}
    </div>
  );
}

// Level 3: Analytics
function AnalyticsComponent() {
  return (
    <div>
      <AnalyticsTabs />
      <Outlet /> {/* Renders specific analytics view */}
    </div>
  );
}

const RoutesView = createRoutesView({
  routes: [
    createRouteView({
      route: appRoute,
      view: AppLayout,
      children: [
        createRouteView({
          route: dashboardRoute,
          view: DashboardComponent,
          children: [
            createRouteView({
              route: analyticsRoute,
              view: AnalyticsComponent,
              children: [
                createRouteView({ route: chartsRoute, view: ChartsComponent }),
                createRouteView({ route: tablesRoute, view: TablesComponent }),
              ],
            }),
            createRouteView({ route: reportsRoute, view: ReportsComponent }),
          ],
        }),
      ],
    }),
  ],
});
```

## Empty State

When no child route is active, Outlet renders nothing:

```tsx
function ParentComponent() {
  return (
    <div>
      <h1>Parent</h1>
      <Outlet /> {/* null when no child route is active */}
    </div>
  );
}
```

To show a default view:

```tsx
function ParentComponent() {
  const activeRoutes = useUnit(router.$activeRoutes);
  const hasActiveChild = activeRoutes.length > 1;

  return (
    <div>
      <h1>Parent</h1>
      {hasActiveChild ? (
        <Outlet />
      ) : (
        <div>Select an item from the sidebar</div>
      )}
    </div>
  );
}
```

## With Route Parameters

Child routes can access parent route parameters:

```tsx
import { useUnit } from 'effector-react';

const teamRoute = createRoute({ path: '/team/:teamId' });
const membersRoute = createRoute({ path: '/members', parent: teamRoute });

function TeamComponent() {
  const params = useUnit(teamRoute.$params);
  
  return (
    <div>
      <h1>Team {params.teamId}</h1>
      <Outlet /> {/* Child can also access teamId */}
    </div>
  );
}

function MembersComponent() {
  const params = useUnit(teamRoute.$params);
  
  return <div>Members of team {params.teamId}</div>;
}
```

## Return Value

Returns:
- The active child route's component
- `null` if no child route is active

## See Also

- [createRouteView](./create-route-view) - Create route views with children
- [createRoutesView](./create-routes-view) - Render active routes
- [useOpenedViews](./use-opened-views) - Hook to track opened routes

