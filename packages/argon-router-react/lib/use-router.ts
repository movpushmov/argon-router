import { useContext } from 'react';
import { RouterProviderContext } from './context';

export function useRouter() {
  const router = useContext(RouterProviderContext);

  if (!router) {
    throw new Error(
      '[useRouter] Router not found. Insert RouterProvider in app root',
    );
  }

  return router;
}
