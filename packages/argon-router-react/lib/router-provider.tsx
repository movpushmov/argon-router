import { ReactNode } from 'react';
import { Router } from '@argon-router/core';
import { RouterProviderContext } from './context';

interface RouterProviderProps {
  children?: ReactNode;
  router: Router;
}

export const RouterProvider = (props: RouterProviderProps) => {
  return (
    <RouterProviderContext.Provider value={props.router}>
      {props.children}
    </RouterProviderContext.Provider>
  );
};
