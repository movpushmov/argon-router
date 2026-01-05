# Adapters

Adapters bridge argon-router with browser history APIs, enabling URL synchronization and navigation. Argon-router includes two built-in adapters and supports custom adapter creation.

## Overview

An adapter translates between argon-router's internal navigation system and external history management libraries (like the `history` package). Adapters handle:

- Reading and updating URL location
- Managing browser history stack
- Listening to navigation events
- Providing back/forward navigation

## Built-in Adapters

### historyAdapter

Standard adapter for pathname-based navigation using the [`history`](https://github.com/remix-run/history) library.

**Use case:** Traditional web navigation where routes are in the URL pathname.

**Installation:**

```bash
npm install history
```

**Basic Usage:**

```ts
import { createRouter, historyAdapter } from '@argon-router/core';
import { createBrowserHistory } from 'history';

const router = createRouter({
  routes: [homeRoute, aboutRoute],
});

const history = createBrowserHistory();
router.setHistory(historyAdapter(history));

// Navigation changes URL pathname
aboutRoute.open();
// URL: /about
```

**With Effector Scope:**

```ts
import { allSettled, fork } from 'effector';
import { createBrowserHistory } from 'history';
import { historyAdapter } from '@argon-router/core';

const scope = fork();
const history = createBrowserHistory();

await allSettled(router.setHistory, {
  scope,
  params: historyAdapter(history),
});
```

**History Types:**

```ts
// Browser History - Full URLs
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();
// URL: http://localhost:3000/about

// Hash History - Static hosting
import { createHashHistory } from 'history';
const history = createHashHistory();
// URL: http://localhost:3000/#/about

// Memory History - Testing, SSR, React Native
import { createMemoryHistory } from 'history';
const history = createMemoryHistory({
  initialEntries: ['/'],
  initialIndex: 0,
});
// No URL changes, all in memory
```

**React Application Example:**

```ts
import { createRoot } from 'react-dom/client';
import { Provider } from 'effector-react';
import { allSettled, fork } from 'effector';
import { createBrowserHistory } from 'history';
import { historyAdapter } from '@argon-router/core';

async function render() {
  const scope = fork();
  const history = createBrowserHistory();

  await allSettled(router.setHistory, {
    scope,
    params: historyAdapter(history),
  });

  createRoot(document.getElementById('root')!).render(
    <Provider value={scope}>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </Provider>,
  );
}

render();
```

### queryAdapter

Specialized adapter that stores navigation state in URL query parameters instead of the pathname.

**Use case:** Modal routing, tabs, embedded apps, or secondary navigation where the main URL should remain constant.

**Basic Usage:**

```ts
import { createRouter, queryAdapter } from '@argon-router/core';
import { createBrowserHistory } from 'history';

const router = createRouter({
  routes: [settingsModal, profileModal],
});

const history = createBrowserHistory();
router.setHistory(queryAdapter(history));

// Navigation changes query params, not pathname
settingsModal.open();
// URL: /app?page=/settings
```

**Comparison:**

| Feature | historyAdapter | queryAdapter |
| ------- | -------------- | ------------ |
| URL Location | Pathname | Query parameters |
| Example URL | `/user/123` | `/app?page=/user/123` |
| Use Case | Main navigation | Modal/tab navigation |
| SEO | ✅ Good | ⚠️ Limited |

**Modal Routing Example:**

```ts
// Main router (pathname)
const mainRouter = createRouter({
  routes: [homeRoute, aboutRoute],
});
mainRouter.setHistory(historyAdapter(createBrowserHistory()));

// Modal router (query params)
const modalRouter = createRouter({
  routes: [loginModal, settingsModal],
});
modalRouter.setHistory(queryAdapter(createBrowserHistory()));

// Navigate main route
aboutRoute.open();
// URL: /about

// Open modal
loginModal.open();
// URL: /about?modal=/login

// Main route stays /about while modal changes
```

**Tab Navigation Example:**

```ts
const tabRouter = createRouter({
  routes: [overviewTab, analyticsTab, settingsTab],
});

tabRouter.setHistory(queryAdapter(createBrowserHistory()));

// Switch tabs
overviewTab.open();
// URL: /app?tab=/overview

analyticsTab.open();
// URL: /app?tab=/analytics

// Back button works!
history.back();
// URL: /app?tab=/overview
```

## Custom Adapters

Create custom adapters to integrate with any navigation system.

### Adapter Interface

```typescript
interface RouterAdapter {
  location: RouterLocation;
  push: (to: To) => void;
  replace: (to: To) => void;
  goBack: () => void;
  goForward: () => void;
  listen: (callback: (location: RouterLocation) => void) => Subscription;
}

interface RouterLocation {
  pathname: string;
  search: string;
  hash: string;
}

type To = string | Partial<RouterLocation>;
```

### Creating a Custom Adapter

**Example 1: Console Logger Adapter**

```ts
import type { RouterAdapter } from '@argon-router/core';

function consoleAdapter(): RouterAdapter {
  let currentLocation = {
    pathname: '/',
    search: '',
    hash: '',
  };

  const listeners = new Set<(location: RouterLocation) => void>();

  const notify = () => {
    listeners.forEach((listener) => listener(currentLocation));
  };

  return {
    location: currentLocation,

    push: (to) => {
      if (typeof to === 'string') {
        currentLocation = { pathname: to, search: '', hash: '' };
      } else {
        currentLocation = {
          pathname: to.pathname ?? currentLocation.pathname,
          search: to.search ?? currentLocation.search,
          hash: to.hash ?? currentLocation.hash,
        };
      }
      console.log('Navigate to:', currentLocation);
      notify();
    },

    replace: (to) => {
      if (typeof to === 'string') {
        currentLocation = { pathname: to, search: '', hash: '' };
      } else {
        currentLocation = {
          pathname: to.pathname ?? currentLocation.pathname,
          search: to.search ?? currentLocation.search,
          hash: to.hash ?? currentLocation.hash,
        };
      }
      console.log('Replace with:', currentLocation);
      notify();
    },

    goBack: () => {
      console.log('Go back');
    },

    goForward: () => {
      console.log('Go forward');
    },

    listen: (callback) => {
      listeners.add(callback);
      return {
        unsubscribe: () => {
          listeners.delete(callback);
        },
      };
    },
  };
}

// Use it
router.setHistory(consoleAdapter());
```

**Example 2: Local Storage Adapter**

```ts
function localStorageAdapter(): RouterAdapter {
  const STORAGE_KEY = 'router-location';

  const getLocation = (): RouterLocation => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { pathname: '/', search: '', hash: '' };
  };

  const setLocation = (location: RouterLocation) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  };

  let currentLocation = getLocation();
  const listeners = new Set<(location: RouterLocation) => void>();

  const updateLocation = (to: To) => {
    if (typeof to === 'string') {
      currentLocation = { pathname: to, search: '', hash: '' };
    } else {
      currentLocation = {
        pathname: to.pathname ?? currentLocation.pathname,
        search: to.search ?? currentLocation.search,
        hash: to.hash ?? currentLocation.hash,
      };
    }
    setLocation(currentLocation);
    listeners.forEach((listener) => listener(currentLocation));
  };

  return {
    location: currentLocation,
    push: updateLocation,
    replace: updateLocation,
    goBack: () => console.log('Back not supported'),
    goForward: () => console.log('Forward not supported'),
    listen: (callback) => {
      listeners.add(callback);
      return { unsubscribe: () => listeners.delete(callback) };
    },
  };
}
```

**Example 3: React Native Adapter**

```ts
import { Linking } from 'react-native';

function reactNativeAdapter(): RouterAdapter {
  let currentLocation: RouterLocation = {
    pathname: '/',
    search: '',
    hash: '',
  };

  const listeners = new Set<(location: RouterLocation) => void>();

  // Parse deep link URL
  const parseUrl = (url: string): RouterLocation => {
    try {
      const parsed = new URL(url);
      return {
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
      };
    } catch {
      return { pathname: url, search: '', hash: '' };
    }
  };

  // Initialize with current URL
  Linking.getInitialURL().then((url) => {
    if (url) {
      currentLocation = parseUrl(url);
    }
  });

  // Listen to deep links
  const subscription = Linking.addEventListener('url', ({ url }) => {
    currentLocation = parseUrl(url);
    listeners.forEach((listener) => listener(currentLocation));
  });

  return {
    location: currentLocation,

    push: (to) => {
      const newLocation =
        typeof to === 'string'
          ? parseUrl(to)
          : {
              pathname: to.pathname ?? currentLocation.pathname,
              search: to.search ?? currentLocation.search,
              hash: to.hash ?? currentLocation.hash,
            };

      currentLocation = newLocation;

      // Update React Native navigation
      const url = `myapp://${newLocation.pathname}${newLocation.search}${newLocation.hash}`;
      Linking.openURL(url);

      listeners.forEach((listener) => listener(currentLocation));
    },

    replace: (to) => {
      // Same as push for React Native
      this.push(to);
    },

    goBack: () => {
      // Handle via React Navigation or custom logic
    },

    goForward: () => {
      // Not typically supported in mobile
    },

    listen: (callback) => {
      listeners.add(callback);
      return {
        unsubscribe: () => {
          listeners.delete(callback);
          subscription.remove();
        },
      };
    },
  };
}
```

**Example 4: Electron IPC Adapter**

```ts
import { ipcRenderer } from 'electron';

function electronAdapter(): RouterAdapter {
  let currentLocation: RouterLocation = {
    pathname: '/',
    search: '',
    hash: '',
  };

  const listeners = new Set<(location: RouterLocation) => void>();

  // Listen to navigation from main process
  ipcRenderer.on('navigate', (_, location: RouterLocation) => {
    currentLocation = location;
    listeners.forEach((listener) => listener(currentLocation));
  });

  return {
    location: currentLocation,

    push: (to) => {
      const newLocation =
        typeof to === 'string'
          ? { pathname: to, search: '', hash: '' }
          : {
              pathname: to.pathname ?? currentLocation.pathname,
              search: to.search ?? currentLocation.search,
              hash: to.hash ?? currentLocation.hash,
            };

      currentLocation = newLocation;

      // Send to main process
      ipcRenderer.send('router-navigate', newLocation);

      listeners.forEach((listener) => listener(currentLocation));
    },

    replace: (to) => {
      // Same as push for Electron
      this.push(to);
    },

    goBack: () => {
      ipcRenderer.send('router-back');
    },

    goForward: () => {
      ipcRenderer.send('router-forward');
    },

    listen: (callback) => {
      listeners.add(callback);
      return {
        unsubscribe: () => {
          listeners.delete(callback);
        },
      };
    },
  };
}
```

## Adapter Requirements

When creating a custom adapter, ensure:

### 1. Initial Location

Provide initial location when created:

```ts
return {
  location: {
    pathname: '/',
    search: '',
    hash: '',
  },
  // ...
};
```

### 2. Handle String and Object Navigation

Support both formats:

```ts
push: (to) => {
  if (typeof to === 'string') {
    // Handle string: '/about'
    navigate({ pathname: to, search: '', hash: '' });
  } else {
    // Handle object: { pathname: '/about', search: '?id=1' }
    navigate({
      pathname: to.pathname ?? current.pathname,
      search: to.search ?? current.search,
      hash: to.hash ?? current.hash,
    });
  }
}
```

### 3. Notify Listeners

Call all listeners when location changes:

```ts
const listeners = new Set<(location: RouterLocation) => void>();

const notify = () => {
  listeners.forEach((listener) => listener(currentLocation));
};

// After navigation
push: (to) => {
  // ... update location
  notify();
}
```

### 4. Return Unsubscribe Function

The `listen` method must return an object with `unsubscribe`:

```ts
listen: (callback) => {
  listeners.add(callback);
  
  return {
    unsubscribe: () => {
      listeners.delete(callback);
      // Cleanup any resources
    },
  };
}
```

### 5. Maintain Location State

Keep `location` property synchronized:

```ts
const adapter = {
  location: currentLocation, // Always current

  push: (to) => {
    currentLocation = newLocation;
    this.location = currentLocation; // Update reference
    notify();
  },
};
```

## Testing Adapters

### Test with Memory History

```ts
import { createMemoryHistory } from 'history';
import { historyAdapter } from '@argon-router/core';
import { allSettled, fork } from 'effector';

test('navigation works', async () => {
  const scope = fork();
  const history = createMemoryHistory({ initialEntries: ['/'] });

  await allSettled(router.setHistory, {
    scope,
    params: historyAdapter(history),
  });

  await allSettled(aboutRoute.open, { scope });

  expect(history.location.pathname).toBe('/about');
  expect(scope.getState(aboutRoute.$isOpened)).toBe(true);
});
```

### Test Custom Adapter

```ts
test('custom adapter', async () => {
  const locations: RouterLocation[] = [];

  const mockAdapter: RouterAdapter = {
    location: { pathname: '/', search: '', hash: '' },
    push: (to) => {
      const location = typeof to === 'string' 
        ? { pathname: to, search: '', hash: '' }
        : { pathname: to.pathname ?? '/', search: '', hash: '' };
      locations.push(location);
    },
    replace: vi.fn(),
    goBack: vi.fn(),
    goForward: vi.fn(),
    listen: () => ({ unsubscribe: () => {} }),
  };

  const scope = fork();
  await allSettled(router.setHistory, { scope, params: mockAdapter });

  await allSettled(aboutRoute.open, { scope });

  expect(locations).toContainEqual({ pathname: '/about', search: '', hash: '' });
});
```

## Best Practices

### Use Built-in Adapters When Possible

```ts
// ✅ Recommended for web apps
router.setHistory(historyAdapter(createBrowserHistory()));

// ✅ Recommended for modals/tabs
modalRouter.setHistory(queryAdapter(createBrowserHistory()));

// ⚠️ Only create custom adapters when necessary
router.setHistory(customAdapter());
```

### Initialize Early

Set adapter before any navigation:

```ts
// ✅ Good
await allSettled(router.setHistory, { scope, params: adapter });
await allSettled(homeRoute.open, { scope });

// ❌ Bad
await allSettled(homeRoute.open, { scope });
await allSettled(router.setHistory, { scope, params: adapter });
```

### Single Adapter Instance

Create only one adapter per router:

```ts
// ✅ Good
const adapter = historyAdapter(createBrowserHistory());
router.setHistory(adapter);

// ❌ Bad
router.setHistory(historyAdapter(createBrowserHistory()));
router.setHistory(historyAdapter(createBrowserHistory())); // Different instance
```

### Clean Up Resources

Ensure proper cleanup in custom adapters:

```ts
listen: (callback) => {
  listeners.add(callback);
  
  // Setup subscriptions
  const subscription = externalLibrary.subscribe(callback);
  
  return {
    unsubscribe: () => {
      listeners.delete(callback);
      subscription.unsubscribe(); // ✅ Cleanup
    },
  };
}
```

## API Reference

### `historyAdapter(history: History): RouterAdapter`

Creates a standard pathname-based adapter.

**Parameters:**
- `history: History` - History instance from `history` package

**Returns:** `RouterAdapter`

### `queryAdapter(history: History): RouterAdapter`

Creates a query parameter-based adapter.

**Parameters:**
- `history: History` - History instance from `history` package

**Returns:** `RouterAdapter`

### Types

```typescript
interface RouterAdapter {
  location: RouterLocation;
  push: (to: To) => void;
  replace: (to: To) => void;
  goBack: () => void;
  goForward: () => void;
  listen: (callback: (location: RouterLocation) => void) => Subscription;
}

interface RouterLocation {
  pathname: string;
  search: string;
  hash: string;
}

type To = string | Partial<RouterLocation>;

interface Subscription {
  unsubscribe: () => void;
}
```

## See Also

- [createRouter](/core/create-router) - Create a router with adapters
- [createRouterControls](/core/create-router-controls) - Create navigation controls
- [trackQuery](/core/track-query) - Track query parameters

