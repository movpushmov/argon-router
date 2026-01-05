# Core

The core package of Argon Router provides the fundamental routing primitives powered by [Effector](https://effector.dev).

## Overview

`@argon-router/core` is the foundation of Argon Router. It provides:

- **Route Creation** - Define routes with paths and parameters
- **Router Management** - Central navigation state management
- **Type Safety** - Full TypeScript support with automatic type inference
- **State Management** - Powered by Effector for predictable updates
- **Query Tracking** - Monitor and react to query parameter changes

## Installation

```bash
npm install @argon-router/core effector
```

## Key Concepts

### Routes

Routes represent navigable locations in your app. They can be created with or without a path:

**Path routes** - Routes with URL paths:
```tsx
import { createRoute } from '@argon-router/core';

const homeRoute = createRoute({ path: '/home' });
const userRoute = createRoute({ path: '/user/:id' });
```

**Pathless routes** - Routes without URL paths:
```tsx
const dialogRoute = createRoute(); // No path
const modalRoute = createRoute<{ title: string }>(); // With typed params
```

All routes have:
- State stores: `$isOpened`, `$params`, `$isPending`
- Events: `open`, `opened`, `closed`
- Optional: `parent`, `beforeOpen`

### Router

The router manages multiple routes and their state. You can register routes with paths directly, or assign paths to pathless routes:

```tsx
import { createRouter } from '@argon-router/core';

// Routes with paths
const router = createRouter({
  routes: [homeRoute, userRoute, profileRoute],
});

// Pathless routes need paths assigned in router
const dialogRoute = createRoute();
const router = createRouter({
  routes: [
    homeRoute,
    { path: '/dialog', route: dialogRoute }, // Assign path here
  ],
});
```

### Navigation

Navigate by opening routes:

```tsx
// Simple navigation
homeRoute.open();

// With parameters
userRoute.open({ params: { id: '123' } });

// With query parameters
homeRoute.open({ query: { tab: 'settings' } });

// Replace instead of push
profileRoute.open({ replace: true });
```

## Core APIs

### Route Management

- [createRoute](/core/create-route) - Create a route with path and parameters
- [createVirtualRoute](/core/create-virtual-route) - Create a route without a path
- [chainRoute](/core/chain-route) - Create routes with conditional navigation

### Router Management

- [createRouter](/core/create-router) - Create a router instance
- [createRouterControls](/core/create-router-controls) - Create router controls separately

### Advanced Features

- [trackQuery](/core/track-query) - Track query parameter changes
- [group](/core/group) - Group related routes

## Quick Example

```tsx
import { createRoute, createRouter, historyAdapter } from '@argon-router/core';
import { createMemoryHistory } from 'history';

// 1. Create routes
const homeRoute = createRoute({ path: '/home' });
const profileRoute = createRoute({ path: '/profile/:id' });

// 2. Create router
const router = createRouter({
  routes: [homeRoute, profileRoute],
});

// 3. Connect to history
const history = createMemoryHistory();
router.setHistory(historyAdapter(history));

// 4. Navigate
homeRoute.open(); // Opens /home
profileRoute.open({ params: { id: '123' } }); // Opens /profile/123

// 5. React to state changes
router.$path.watch((path) => {
  console.log('Current path:', path);
});

homeRoute.$isOpened.watch((isOpened) => {
  console.log('Home route opened:', isOpened);
});
```

## Type Safety

Argon Router provides full type safety:

```tsx
const userRoute = createRoute({ path: '/user/:id/:section' });
// Type: Route<{ id: string; section: string }>

// ✅ Type-safe
userRoute.open({ params: { id: '1', section: 'posts' } });

// ❌ TypeScript error
userRoute.open({ params: { id: 1 } }); // id must be string
userRoute.open({ params: { id: '1' } }); // section is required
```

## Next Steps

- [createRoute](/core/create-route) - Learn about creating routes
- [createRouter](/core/create-router) - Set up your router
- [React Package](/react/create-route-view) - Use with React
- [React Native Package](/react-native/index) - Use with React Native

