# Stack Navigator

Creates a Stack Navigator that integrates Argon Router with React Navigation's Stack Navigator.

## Import

```ts
import { createArgonStackNavigator } from '@argon-router/react-native';
```

## Usage

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createArgonStackNavigator } from '@argon-router/react-native';
import { createRouter, createRoute } from '@argon-router/core';
import { createRouteView, RouterProvider } from '@argon-router/react';

const homeRoute = createRoute({ path: '/home' });
const detailsRoute = createRoute({ path: '/details/:id' });

const router = createRouter({
  routes: [homeRoute, detailsRoute],
});

const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => (
    <View>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => detailsRoute.open({ params: { id: '123' } })}
      />
    </View>
  ),
});

const DetailsScreen = createRouteView({
  route: detailsRoute,
  view: () => {
    const params = useUnit(detailsRoute.$params);
    return <Text>Details: {params.id}</Text>;
  },
});

const StackNavigator = createArgonStackNavigator({
  router,
  routes: [HomeScreen, DetailsScreen],
  screenOptions: {
    headerStyle: { backgroundColor: '#f4511e' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
  },
});

export default function App() {
  return (
    <RouterProvider router={router}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </RouterProvider>
  );
}
```

## Configuration

### `router` (required)

Argon Router instance created with `createRouter`.

```tsx
const router = createRouter({
  routes: [homeRoute, profileRoute],
});

const StackNavigator = createArgonStackNavigator({
  router,
  routes: [HomeScreen, ProfileScreen],
});
```

### `routes` (required)

Array of route views created with `createRouteView` or `createLazyRouteView`.

```tsx
const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => <Text>Home</Text>,
});

const StackNavigator = createArgonStackNavigator({
  router,
  routes: [HomeScreen, ProfileScreen],
});
```

### `screenOptions`

Options applied to all screens. Accepts all React Navigation Stack Navigator options.

```tsx
const StackNavigator = createArgonStackNavigator({
  router,
  routes: [HomeScreen, ProfileScreen],
  screenOptions: {
    // Header
    headerShown: true,
    headerTitle: 'My App',
    headerStyle: { backgroundColor: '#f4511e' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },

    // Gestures
    gestureEnabled: true,
    gestureDirection: 'horizontal',

    // Card
    cardStyle: { backgroundColor: '#fff' },
    presentation: 'card', // or 'modal', 'transparentModal'

    // Animation
    animationEnabled: true,
  },
});
```

See [React Navigation Stack Navigator documentation](https://reactnavigation.org/docs/stack-navigator) for all available options.

### `initialRouteName`

Name of the route to render on initial render.

```tsx
const StackNavigator = createArgonStackNavigator({
  router,
  routes: [HomeScreen, ProfileScreen],
  initialRouteName: '/home',
});
```

## Navigation

Navigate using Argon Router route methods:

```tsx
// Open route
homeRoute.open();

// With parameters
profileRoute.open({ params: { id: '123' } });

// With query
homeRoute.open({ query: { tab: 'settings' } });

// Replace
profileRoute.open({ replace: true });
```

## Type Safety

Route parameters are type-safe:

```tsx
const userRoute = createRoute({ path: '/user/:id/:tab' });
// Type: Route<{ id: string; tab: string }>

userRoute.open({
  params: { id: '123', tab: 'posts' }, // ✅ Type-safe
});

userRoute.open({ params: { id: 123 } }); // ❌ Error: id must be string
```
