import { useContext } from 'react';
import { RouterProviderContext } from './context';
import { useUnit } from 'effector-react';

export function useRouterContext() {
  const context = useContext(RouterProviderContext);

  if (!context) {
    throw new Error(
      '[useRouter] Router not found. Add RouterProvider in app root',
    );
  }

  return context;
}

/**
 * @description Use router from provider
 * @returns Router
 * @link https://movpushmov.dev/argon-router/react/use-router.html
 */
export function useRouter() {
  return useUnit(useRouterContext());
}
