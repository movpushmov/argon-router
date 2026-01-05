import type { Router } from '@argon-router/core';
import { createContext } from 'react';
import type { RouteView } from './types';

export const RouterProviderContext = createContext<Router | null>(null);
export const OutletContext = createContext<{ children: RouteView[] } | null>(
  null,
);
