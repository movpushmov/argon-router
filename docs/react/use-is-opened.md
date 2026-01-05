# useIsOpened

Check if a route or router is currently active.

## API

```typescript
function useIsOpened(route: Route | Router): boolean
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `route` | `Route \| Router` | The route or router to check |

### Returns

`boolean` - `true` if the route is opened or router has active routes, `false` otherwise.

## Usage

### Check Route State

```tsx
import { useIsOpened } from '@argon-router/react';
import { homeRoute, settingsRoute } from './routes';

function Navigation() {
  const isHomeActive = useIsOpened(homeRoute);
  const isSettingsActive = useIsOpened(settingsRoute);

  return (
    <nav>
      <a 
        href="/home" 
        className={isHomeActive ? 'active' : ''}
      >
        Home
      </a>
      <a 
        href="/settings" 
        className={isSettingsActive ? 'active' : ''}
      >
        Settings
      </a>
    </nav>
  );
}
```

### Check Router State

```tsx
import { useIsOpened } from '@argon-router/react';
import { adminRouter } from './routers';

function AdminPanel() {
  const isAdminActive = useIsOpened(adminRouter);

  if (!isAdminActive) {
    return null;
  }

  return <div>Admin Panel Content</div>;
}
```

### Conditional Rendering

```tsx
import { useIsOpened } from '@argon-router/react';
import { profileRoute } from './routes';

function UserMenu() {
  const isProfileOpen = useIsOpened(profileRoute);

  return (
    <div>
      <button>Menu</button>
      {isProfileOpen && (
        <div className="submenu">
          <a href="/profile/settings">Settings</a>
          <a href="/profile/billing">Billing</a>
        </div>
      )}
    </div>
  );
}
```

### Active Tab Indicator

```tsx
import { useIsOpened } from '@argon-router/react';
import { dashboardRoute, reportsRoute, analyticsRoute } from './routes';

function TabNavigation() {
  const tabs = [
    { route: dashboardRoute, label: 'Dashboard' },
    { route: reportsRoute, label: 'Reports' },
    { route: analyticsRoute, label: 'Analytics' },
  ];

  return (
    <div className="tabs">
      {tabs.map(({ route, label }) => {
        const isActive = useIsOpened(route);
        return (
          <button
            key={label}
            onClick={() => route.open()}
            className={isActive ? 'tab-active' : 'tab-inactive'}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

## How It Works

- For **routes**: Returns the value of `route.$isOpened` store
- For **routers**: Returns `true` if `router.$activeRoutes` has any items

## Best Practices

### Use for UI State Only

`useIsOpened` is perfect for visual indicators and conditional styling:

```tsx
function Sidebar() {
  const isSettingsOpen = useIsOpened(settingsRoute);

  return (
    <aside>
      <Link to={settingsRoute}>
        Settings {isSettingsOpen && '•'}
      </Link>
    </aside>
  );
}
```

### Combine with Other Hooks

```tsx
import { useIsOpened, useRouter } from '@argon-router/react';

function NavItem({ route, children }) {
  const isActive = useIsOpened(route);
  const router = useRouter();

  return (
    <button
      onClick={() => route.open()}
      disabled={isActive}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </button>
  );
}
```

### Performance

The hook subscribes to Effector stores and automatically updates when the route state changes. It's optimized and safe to use in multiple components.

## See Also

- [Link](/react/link) - Navigation component with automatic active state
- [useRouter](/react/use-router) - Access router instance
- [useOpenedViews](/react/use-opened-views) - Get all currently opened route views

