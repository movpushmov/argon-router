# Bottom Tabs Navigator

Creates a Bottom Tabs Navigator that integrates Argon Router with React Navigation's Bottom Tabs Navigator.

## Import

```ts
import { createArgonBottomTabsNavigator } from '@argon-router/react-native';
```

## Usage

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createArgonBottomTabsNavigator } from '@argon-router/react-native';
import { createRouter, createRoute } from '@argon-router/core';
import { createRouteView, RouterProvider } from '@argon-router/react';
import Icon from 'react-native-vector-icons/Ionicons';

const homeRoute = createRoute({ path: '/home' });
const searchRoute = createRoute({ path: '/search' });
const profileRoute = createRoute({ path: '/profile' });

const router = createRouter({
  routes: [homeRoute, searchRoute, profileRoute],
});

const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => <Text>Home Screen</Text>,
});

const SearchScreen = createRouteView({
  route: searchRoute,
  view: () => <Text>Search Screen</Text>,
});

const ProfileScreen = createRouteView({
  route: profileRoute,
  view: () => <Text>Profile Screen</Text>,
});

const TabsNavigator = createArgonBottomTabsNavigator({
  router,
  routes: [HomeScreen, SearchScreen, ProfileScreen],
  screenOptions: {
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#8e8e93',
    tabBarIcon: ({ color, size }) => (
      <Icon name="home" size={size} color={color} />
    ),
  },
});

export default function App() {
  return (
    <RouterProvider router={router}>
      <NavigationContainer>
        <TabsNavigator />
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
  routes: [homeRoute, searchRoute, profileRoute],
});

const TabsNavigator = createArgonBottomTabsNavigator({
  router,
  routes: [HomeScreen, SearchScreen, ProfileScreen],
});
```

### `routes` (required)

Array of route views created with `createRouteView` or `createLazyRouteView`.

```tsx
const HomeScreen = createRouteView({
  route: homeRoute,
  view: () => <Text>Home</Text>,
});

const TabsNavigator = createArgonBottomTabsNavigator({
  router,
  routes: [HomeScreen, SearchScreen, ProfileScreen],
});
```

### `screenOptions`

Options applied to all tabs. Accepts all React Navigation Bottom Tabs Navigator options.

```tsx
const TabsNavigator = createArgonBottomTabsNavigator({
  router,
  routes: [HomeScreen, SearchScreen, ProfileScreen],
  screenOptions: {
    // Colors
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#8e8e93',
    tabBarActiveBackgroundColor: '#fff',
    tabBarInactiveBackgroundColor: '#f8f8f8',

    // Styles
    tabBarStyle: {
      backgroundColor: '#fff',
      borderTopColor: '#e0e0e0',
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
    },
    tabBarIconStyle: {
      marginBottom: 4,
    },

    // Icon
    tabBarIcon: ({ color, size, focused }) => (
      <Icon
        name={focused ? 'home' : 'home-outline'}
        size={size}
        color={color}
      />
    ),

    // Badge
    tabBarBadge: 3,
    tabBarBadgeStyle: { backgroundColor: 'red' },

    // Visibility
    tabBarShowLabel: true,
  },
});
```

See [React Navigation Bottom Tabs documentation](https://reactnavigation.org/docs/bottom-tab-navigator) for all available options.

### `initialRouteName`

Name of the route to render on initial render.

```tsx
const TabsNavigator = createArgonBottomTabsNavigator({
  router,
  routes: [HomeScreen, SearchScreen, ProfileScreen],
  initialRouteName: '/home',
});
```

## Custom Tab Icons

Customize icons per screen using `screenOptions` function:

```tsx
const TabsNavigator = createArgonBottomTabsNavigator({
  router,
  routes: [HomeScreen, SearchScreen, ProfileScreen],
  screenOptions: ({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === '/home') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === '/search') {
        iconName = focused ? 'search' : 'search-outline';
      } else if (route.name === '/profile') {
        iconName = focused ? 'person' : 'person-outline';
      }

      return <Icon name={iconName} size={size} color={color} />;
    },
  }),
});
```

## Navigation

Navigate using Argon Router route methods. Tab press events automatically trigger route opening:

```tsx
// Open tab programmatically
homeRoute.open();
searchRoute.open();

// Tab bar handles user taps automatically
// User taps → Tab press → Argon Router opens route → UI updates
```

## Type Safety

Route parameters are type-safe:

```tsx
const userRoute = createRoute({ path: '/user/:id' });
// Type: Route<{ id: string }>

userRoute.open({
  params: { id: '123' }, // ✅ Type-safe
});
```
