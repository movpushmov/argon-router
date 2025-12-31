import * as React from 'react';
import { useEffect } from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import type { Router, Route } from '@argon-router/core';
import type { RouteView } from '@argon-router/react';
import { useOpenedViews } from '@argon-router/react';
import { createWatch } from 'effector';
import { useProvidedScope } from 'effector-react';

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
  const {
    router: argonRouter,
    routes,
    screenOptions,
    initialRouteName,
  } = config;

  const ArgonStackNavigator = function ArgonStackNavigator() {
    const scope = useProvidedScope();
    const openedViews = useOpenedViews(routes);
    const navigationRef = React.useRef<any>(null);

    // Sync Argon Router state with React Navigation
    useEffect(() => {
      const subscription = createWatch({
        unit: argonRouter.$path,
        scope: scope ?? undefined,
        fn: (path) => {
          if (!navigationRef.current || !path) return;

          // Find the matching route for the current path
          const matchingView = openedViews[openedViews.length - 1];
          if (matchingView) {
            const routeName = getRouteName(
              matchingView.route,
              routes.findIndex((r) => r.route === matchingView.route),
            );

            // Navigate to the route in React Navigation
            try {
              navigationRef.current.navigate(routeName);
            } catch (error) {
              // Route might not be mounted yet
            }
          }
        },
      });

      return () => subscription.unsubscribe();
    }, [openedViews, scope]);

    return (
      <Stack.Navigator
        screenOptions={screenOptions}
        initialRouteName={initialRouteName}
      >
        {routes.map((routeView, index) => {
          const routeName = getRouteName(routeView.route, index);
          const routeKey = getRouteKey(routeView.route, index);

          return (
            <Stack.Screen
              key={routeKey}
              name={routeName}
              component={routeView.view}
              options={screenOptions}
            />
          );
        })}
      </Stack.Navigator>
    );
  };

  return { Navigator: ArgonStackNavigator };
}
