import { Router } from '@argon-router/core';
import { createContext } from 'react';

export const RouterProviderContext = createContext<Router | null>(null);
