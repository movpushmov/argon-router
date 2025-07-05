import { inject } from 'vue';
import { useUnit } from 'effector-vue/composition';
import { RouterInjectionKey } from './router-provider';

export function useRouterContext() {
  const context = inject(RouterInjectionKey);

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
