import { useRouterContext } from './use-router';
import { useUnit } from 'effector-vue/composition';
import { computed, defineComponent, h } from 'vue';
import { LinkProps } from './types';

/**
 * @description Navigates user to provided route on click
 * @link https://movpushmov.dev/argon-router/react/link.html
 * @example ```tsx
 * import { Link } from '@argon-router/react';
 * import { routes } from '@shared/routing';
 *
 * function Profile({ user }) {
 *   return (
 *     <>
 *       <Link to={routes.settings}>Settings</Link>
 *
 *       {user.posts.map((post) => (
 *         <Link to={routes.editPost} params={{ id: post.id }}>
 *           Edit post
 *         </Link>
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export const Link = defineComponent<LinkProps<any>>((props, { slots }) => {
  const routerContext = useRouterContext();
  const { mappedRoutes } = routerContext;

  const target = computed(() => {
    return mappedRoutes.find(({ route }) => route === props.to);
  });

  if (!target.value) {
    throw new Error(
      `[Link] Route with path "${props.to.path}" not found. Maybe it is not passed into createRouter?`,
    );
  }

  const { onOpen } = useUnit(props.to); // Замените на ваш хук/функцию

  const handleClick = (e: MouseEvent) => {
    props.onClick?.(e);

    if (e.defaultPrevented) return;
    if (props.target && props.target !== '_self') return;
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();
    onOpen({ params: props.params || {} });
  };

  return () =>
    h(
      'a',
      {
        ...props,
        href: target.value?.build(props.params ?? undefined),
        onClick: handleClick,
      },
      slots.default?.(),
    );
});
