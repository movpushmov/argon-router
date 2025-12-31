import { OutletContext } from './context';
import { createElement, useContext } from 'react';
import { useOpenedViews } from './use-opened-views';

/**
 * @description Outlet component for nested routes
 * @link https://movpushmov.dev/argon-router/react/outlet.html
 * @example ```ts
 * export const RoutesView = createRoutesView([
 *   createRouteView({
 *     route: routes.profile,
 *     view: ProfileScreen,
 *     children: [
 *      createRouteView({ route: routes.settings, view: SettingsScreen }),
 *     ]
 *   }),
 * ]);
 *
 * // profile.tsx
 * export const ProfileScreen = () => {
 *   // will render settings screen when profile route is opened
 *   // and settings route is active
 *   return (
 *     <>
 *       <div>Profile</div>
 *       <Outlet />
 *     </>
 *   );
 * };
 * ```
 */
export const Outlet = () => {
  const { children } = useContext(OutletContext) ?? { children: [] };
  const openedView = useOpenedViews(children).at(-1);

  if (!openedView) {
    return null;
  }

  return createElement(openedView.view);
};
