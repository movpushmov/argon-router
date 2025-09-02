# Link

Navigates user to provided route on click. Has similar props with `<a>` element but instead of `href` has `route` and `params` props.

#### `route`

- `type`: Route\<T\>
- `required`: yes

#### `params`

- `type`: `T`
- `required`: if route has params: `yes` otherwise: `no`

#### `query`

- `type`: Query
- `required`: no

#### `replace`

- `type`: boolean
- `required`: no

### Example

```tsx
import { Link } from '@argon-router/react';
import { routes } from '@shared/routing';

function Profile({ user }) {
  return (
    <>
      <Link to={routes.settings}>Settings</Link>

      {user.posts.map((post) => (
        <Link to={routes.editPost} params={{ id: post.id }}>
          Edit post
        </Link>
      ))}
    </>
  );
}
```
