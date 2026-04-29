import * as React from 'react';
import { useEffect } from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import type { Router, Route } from '@argon-router/core';
import type { RouteView } from '@argon-router/react';
import { useOpenedViews } from '@argon-router/react';

export type ArgonStackNavigatorConfig = {
  router: Router;
  routes: RouteView[];
  screenOptions?: StackNavigationOptions;
  initialRouteName?: string;
};

export type { StackNavigationOptions as ArgonStackNavigatorOptions };

const Stack = createStackNavigator();

function getRouteKey(route: Route<any> | Router, index: number): string {
  if ('path' in route && route.path) {
    return route.path;
  }
  return `route-${index}`;
}

function getRouteName(route: Route<any> | Router, index: number): string {
  if ('path' in route && route.path) {
    return route.path;
  }
  return `Route${index}`;
}

function createScreenComponent(routeView: RouteView): React.FC {
  const View = routeView.view;

  function ArgonRouteScreen() {
    return <View />;
  }

  return ArgonRouteScreen;
}

/**
 * Creates an Argon Stack Navigator that integrates with React Navigation
 *
 * @example
 * ```tsx
 * import { createArgonStackNavigator } from '@argon-router/react-native';
 * import { router } from './router';
 * import { HomeScreen, ProfileScreen } from './screens';
 *
 * const StackNavigator = createArgonStackNavigator({
 *   router,
 *   routes: [HomeScreen, ProfileScreen],
 *   screenOptions: {
 *     headerStyle: { backgroundColor: '#f4511e' },
 *     headerTintColor: '#fff',
 *   },
 * });
 *
 * function App() {
 *   return (
 *     <NavigationContainer>
 *       <StackNavigator />
 *     </NavigationContainer>
 *   );
 * }
 * ```
 */
export function createArgonStackNavigator(config: ArgonStackNavigatorConfig): {
  Navigator: React.ComponentType;
} {
  const { routes, screenOptions, initialRouteName } = config;
  const screens = routes.map((routeView) => ({
    routeView,
    component: createScreenComponent(routeView),
  }));

  const ArgonStackNavigator = function ArgonStackNavigator() {
    const openedViews = useOpenedViews(routes);
    const navigationRef = React.useRef<any>(null);

    // Sync Argon Router state with React Navigation
    useEffect(() => {
      if (!navigationRef.current) return;

      const matchingView = openedViews[openedViews.length - 1];
      if (!matchingView) return;

      const matchingIndex = routes.findIndex(
        (r) => r.route === matchingView.route,
      );

      if (matchingIndex === -1) return;

      const routeName = getRouteName(matchingView.route, matchingIndex);

      // Navigate to the route in React Navigation
      try {
        navigationRef.current.navigate(routeName);
      } catch (error) {
        console.error(error);
      }
    }, [openedViews]);

    return (
      <Stack.Navigator
        screenOptions={screenOptions}
        initialRouteName={initialRouteName}
        screenListeners={({ navigation }) => {
          navigationRef.current = navigation;
          return {};
        }}
      >
        {screens.map(({ routeView, component }, index) => {
          const routeName = getRouteName(routeView.route, index);
          const routeKey = getRouteKey(routeView.route, index);

          return (
            <Stack.Screen
              key={routeKey}
              name={routeName}
              component={component}
              options={screenOptions}
            />
          );
        })}
      </Stack.Navigator>
    );
  };

  return { Navigator: ArgonStackNavigator };
}
