import type { RouteOpenedPayload } from '@argon-router/core';
import { type ForwardedRef, forwardRef, type ReactNode } from 'react';
import type { LinkProps } from './types';
import { useLink } from './use-link';

type ForwardedLink = <Params extends object | void = void>(
  props: LinkProps<Params> & { ref?: ForwardedRef<HTMLAnchorElement> },
) => ReactNode;

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
export const Link: ForwardedLink = forwardRef<
  HTMLAnchorElement,
  LinkProps<any>
>((props, ref) => {
  const { to, params, onClick, replace, query, ...anchorProps } = props;

  const { path, onOpen } = useLink(to, params);

  return (
    <a
      {...anchorProps}
      ref={ref}
      href={path}
      onClick={(e) => {
        onClick?.(e);

        // allow user to prevent navigation
        if (e.defaultPrevented) {
          return;
        }

        // let browser handle "_blank" target and etc
        if (anchorProps.target && anchorProps.target !== '_self') {
          return;
        }

        // skip modified events (like cmd + click to open the link in new tab)
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
          return;
        }

        e.preventDefault();

        onOpen({
          params: params || {},
          replace,
          query,
        } as RouteOpenedPayload<any>);
      }}
    />
  );
});
