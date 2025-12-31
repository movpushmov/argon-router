import * as React from 'react';
import { useEffect } from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import type { Router, Route } from '@argon-router/core';
import type { RouteView } from '@argon-router/react';
import { createWatch } from 'effector';
import { useProvidedScope } from 'effector-react';

export type ArgonBottomTabsNavigatorConfig = {
  router: Router;
  routes: RouteView[];
  screenOptions?: BottomTabNavigationOptions;
  initialRouteName?: string;
};

export type { BottomTabNavigationOptions as ArgonBottomTabsNavigatorOptions };

const Tab = createBottomTabNavigator();

function getRouteKey(route: Route<any> | Router, index: number): string {
  if ('path' in route && route.path) {
    return route.path;
  }
  return `tab-${index}`;
}

function getRouteName(route: Route<any> | Router, index: number): string {
  if ('path' in route && route.path) {
    return route.path.replace(/\//g, '') || `Tab${index}`;
  }
  return `Tab${index}`;
}

function getRouteTitle(route: Route<any> | Router, index: number): string {
  if ('path' in route && route.path) {
    const pathParts = route.path.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || `Tab ${index + 1}`;
  }
  return `Tab ${index + 1}`;
}

/**
 * Creates an Argon Bottom Tabs Navigator that integrates with React Navigation
 *
 * @example
 * ```tsx
 * import { createArgonBottomTabsNavigator } from '@argon-router/react-native';
 * import { router } from './router';
 * import { HomeScreen, SearchScreen, ProfileScreen } from './screens';
 *
 * const TabsNavigator = createArgonBottomTabsNavigator({
 *   router,
 *   routes: [HomeScreen, SearchScreen, ProfileScreen],
 *   screenOptions: {
 *     tabBarActiveTintColor: '#007AFF',
 *     tabBarInactiveTintColor: '#8e8e93',
 *   },
 * });
 *
 * function App() {
 *   return (
 *     <NavigationContainer>
 *       <TabsNavigator />
 *     </NavigationContainer>
 *   );
 * }
 * ```
 */
export function createArgonBottomTabsNavigator(
  config: ArgonBottomTabsNavigatorConfig,
): { Navigator: React.ComponentType } {
  const {
    router: argonRouter,
    routes,
    screenOptions,
    initialRouteName,
  } = config;

  const ArgonBottomTabsNavigator = function ArgonBottomTabsNavigator() {
    const scope = useProvidedScope();
    const navigationRef = React.useRef<any>(null);

    // Sync Argon Router state with React Navigation
    useEffect(() => {
      const subscription = createWatch({
        unit: argonRouter.$activeRoutes,
        scope: scope ?? undefined,
        fn: (activeRoutes) => {
          if (!navigationRef.current || activeRoutes.length === 0) return;

          // Find the last active route
          const lastActiveRoute = activeRoutes[activeRoutes.length - 1];
          const matchingIndex = routes.findIndex(
            (r) => r.route === lastActiveRoute,
          );

          if (matchingIndex !== -1) {
            const routeName = getRouteName(
              routes[matchingIndex].route,
              matchingIndex,
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
    }, [scope]);

    // Handle tab press to open route in Argon Router
    const createTabPressHandler = React.useCallback((routeView: RouteView) => {
      return () => {
        if (
          'open' in routeView.route &&
          typeof routeView.route.open === 'function'
        ) {
          routeView.route.open();
        }
      };
    }, []);

    return (
      <Tab.Navigator
        screenOptions={screenOptions}
        initialRouteName={initialRouteName}
      >
        {routes.map((routeView, index) => {
          const routeName = getRouteName(routeView.route, index);
          const routeKey = getRouteKey(routeView.route, index);
          const title = getRouteTitle(routeView.route, index);

          return (
            <Tab.Screen
              key={routeKey}
              name={routeName}
              component={routeView.view}
              options={{
                title,
                ...screenOptions,
              }}
              listeners={{
                tabPress: (e) => {
                  // Prevent default navigation
                  e.preventDefault();
                  // Open route via Argon Router
                  createTabPressHandler(routeView)();
                },
              }}
            />
          );
        })}
      </Tab.Navigator>
    );
  };

  return { Navigator: ArgonBottomTabsNavigator };
}
