# React Native

React Native bindings for Argon Router with React Navigation integration.

## Overview

`@argon-router/react-native` bridges [Argon Router](https://movpushmov.dev/argon-router/)'s state management with [React Navigation](https://reactnavigation.org/)'s native UI components. This package allows you to:

- Manage navigation state with Argon Router (powered by Effector)
- Render UI with React Navigation's native navigators
- Access the full React Navigation API and styling options
- Navigate declaratively through route events

## How It Works

```
┌─────────────────┐
│  Argon Router   │  ← Manages state
│  (Effector)     │
└────────┬────────┘
         │ syncs
         ▼
┌─────────────────┐
│ React Navigation│  ← Renders UI
│ (Stack/Tabs)    │
└─────────────────┘
```

1. **Argon Router** manages which routes are open, their parameters, and navigation state
2. **React Navigation** handles UI rendering, animations, gestures, and platform-specific behavior
3. The adapters **sync state** between both systems

## Installation

```bash
npm install @argon-router/react-native @argon-router/core @argon-router/react \
  @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Also install React Navigation dependencies
npm install react-native-screens react-native-safe-area-context
```

## Quick Example

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createArgonStackNavigator } from '@argon-router/react-native';
import { createRouter, createRoute } from '@argon-router/core';
import { createRouteView, RouterProvider } from '@argon-router/react';

// 1. Define routes
const homeRoute = createRoute({ path: '/home' });
const detailsRoute = createRoute({ path: '/details/:id' });

// 2. Create router
const router = createRouter({
  routes: [homeRoute, detailsRoute],
});

// 3. Create screens
const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => <Text>Home Screen</Text>,
});

const DetailsScreen = createRouteView({
  route: detailsRoute,
  view: () => <Text>Details Screen</Text>,
});

// 4. Create navigator
const StackNavigator = createArgonStackNavigator({
  router,
  routes: [HomeScreen, DetailsScreen],
  screenOptions: {
    headerStyle: { backgroundColor: '#f4511e' },
  },
});

// 5. Use in app
export default function App() {
  return (
    <RouterProvider router={router}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </RouterProvider>
  );
}

// 6. Navigate programmatically
homeRoute.open();
detailsRoute.open({ params: { id: '123' } });
```

## Available Navigators

### [Stack Navigator](/react-native/stack-navigator)

Full-screen navigation with stack-based transitions. Perfect for hierarchical navigation patterns.

```tsx
import { createArgonStackNavigator } from '@argon-router/react-native';

const StackNavigator = createArgonStackNavigator({
  router,
  routes: [HomeScreen, DetailsScreen],
});
```

### [Bottom Tabs Navigator](/react-native/bottom-tabs-navigator)

Tab-based navigation with a bottom tab bar. Ideal for primary app navigation.

```tsx
import { createArgonBottomTabsNavigator } from '@argon-router/react-native';

const TabsNavigator = createArgonBottomTabsNavigator({
  router,
  routes: [HomeTab, SearchTab, ProfileTab],
});
```

## Navigation Approach

All navigation happens through **Argon Router**, not React Navigation directly:

```tsx
// ✅ Navigate via Argon Router
homeRoute.open();
detailsRoute.open({ params: { id: '123' } });

// ❌ Don't use React Navigation's navigation prop
navigation.navigate('Details'); // Avoid this
```

This approach provides:
- Centralized navigation logic
- Easy testing (trigger events in tests)
- State persistence
- Time-travel debugging

## React Navigation Features

While navigation is managed by Argon Router, you still get all React Navigation features:

- Native animations and transitions
- Gesture handling (swipe back, etc.)
- Header customization
- Tab bar customization
- Deep linking support
- Screen options and configuration
- Platform-specific behavior

## Type Safety

Route parameters are automatically inferred:

```tsx
const userRoute = createRoute({ path: '/user/:id/:tab' });
// Type: Route<{ id: string; tab: string }>

// ✅ Type-safe
userRoute.open({ params: { id: '123', tab: 'posts' } });

// ❌ TypeScript error
userRoute.open({ params: { id: 123 } }); // id must be string
```

## Next Steps

- [Stack Navigator API](/react-native/stack-navigator) - Full-screen navigation
- [Bottom Tabs Navigator API](/react-native/bottom-tabs-navigator) - Tab-based navigation
- [Core Package](/core/create-router) - Learn about Argon Router core concepts
- [React Package](/react/create-route-view) - React-specific utilities

