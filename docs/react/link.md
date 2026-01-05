# Link

Navigation component that renders an anchor tag and handles route opening on click.

## Import

```ts
import { Link } from '@argon-router/react';
```

## Usage

```tsx
import { Link } from '@argon-router/react';
import { profileRoute, postRoute } from './routes';

function Navigation() {
  return (
    <nav>
      <Link to={profileRoute}>Profile</Link>
      <Link to={postRoute} params={{ id: '123' }}>
        View Post
      </Link>
    </nav>
  );
}
```

## With Parameters

Pass route parameters:

```tsx
import { Link } from '@argon-router/react';
import { createRoute } from '@argon-router/core';

const userRoute = createRoute({ path: '/user/:id' });

function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <Link to={userRoute} params={{ id: user.id }}>
            {user.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

## With Query Parameters

Add query parameters to the URL:

```tsx
<Link to={searchRoute} query={{ q: 'react', sort: 'popular' }}>
  Search React
</Link>
```

## Replace Navigation

Use `replace` to replace current history entry:

```tsx
<Link to={loginRoute} replace>
  Login
</Link>
```

## Props

### `to` (required)

The route to navigate to:

```tsx
<Link to={homeRoute}>Home</Link>
```

### `params` (optional)

Route parameters (required if route has parameters):

```tsx
const userRoute = createRoute({ path: '/user/:id/:tab' });

<Link to={userRoute} params={{ id: '123', tab: 'posts' }}>
  User Posts
</Link>
```

### `query` (optional)

Query parameters to add to the URL:

```tsx
<Link to={searchRoute} query={{ q: 'term', filter: 'active' }}>
  Search
</Link>
```

### `replace` (optional)

Replace current history entry instead of pushing:

```tsx
<Link to={homeRoute} replace>
  Home
</Link>
```

### Standard Anchor Props

All standard HTML anchor props are supported:

```tsx
<Link
  to={externalRoute}
  className="nav-link"
  target="_blank"
  rel="noopener noreferrer"
>
  External Link
</Link>
```

## Behavior

### Click Handling

The Link component:
- Prevents default browser navigation
- Opens the route via Argon Router
- Respects modifier keys (cmd/ctrl click opens in new tab)
- Allows custom `onClick` handlers
- Supports `e.preventDefault()` to cancel navigation

```tsx
<Link
  to={profileRoute}
  onClick={(e) => {
    if (!user.isLoggedIn) {
      e.preventDefault();
      showLoginModal();
    }
  }}
>
  Profile
</Link>
```

### External Links

Links with `target` attribute other than `_self` use default browser behavior:

```tsx
<Link to={docsRoute} target="_blank">
  Open Docs in New Tab
</Link>
```

### Modifier Keys

Holding modifier keys uses browser's default behavior:
- `Cmd/Ctrl + Click` - Open in new tab
- `Shift + Click` - Open in new window
- `Alt/Option + Click` - Download
- `Ctrl + Shift + Click` - Open in new window (some browsers)

## Type Safety

Parameters are type-checked:

```tsx
const postRoute = createRoute({ path: '/post/:id' });

// ✅ Correct
<Link to={postRoute} params={{ id: '123' }}>Post</Link>

// ❌ TypeScript error - missing params
<Link to={postRoute}>Post</Link>

// ❌ TypeScript error - wrong type
<Link to={postRoute} params={{ id: 123 }}>Post</Link>
```

## Styling

Style like a regular anchor tag:

```tsx
<Link
  to={homeRoute}
  className="nav-link active"
  style={{ color: 'blue', textDecoration: 'none' }}
>
  Home
</Link>
```

## Ref Support

Link supports refs:

```tsx
import { useRef } from 'react';

function Navigation() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  return <Link ref={linkRef} to={homeRoute}>Home</Link>;
}
```

## See Also

- [useLink](./use-link) - Hook for link functionality
- [createRouteView](./create-route-view) - Create route views
- [useRouter](./use-router) - Access router in components
