# useLink

Get path and navigation handler for a route. Useful for building custom link components.

## API

```typescript
function useLink<T extends object | void = void>(
  to: Route<T>,
  params: T
): {
  path: string;
  onOpen: (payload?: RouteOpenedPayload<T>) => void;
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `to` | `Route<T>` | The target route |
| `params` | `T` | Route parameters for building the path |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | The built URL path for the route |
| `onOpen` | `function` | Handler to open the route programmatically |

## Usage

### Basic Custom Link

```tsx
import { useLink } from '@argon-router/react';
import { userRoute } from './routes';

function CustomLink({ userId, children }) {
  const { path, onOpen } = useLink(userRoute, { userId });

  return (
    <a 
      href={path}
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
    >
      {children}
    </a>
  );
}

// Usage
<CustomLink userId="123">View Profile</CustomLink>
```

### Custom Navigation Component

```tsx
import { useLink } from '@argon-router/react';

function NavButton({ route, params, icon, children }) {
  const { path, onOpen } = useLink(route, params);

  return (
    <button
      onClick={() => onOpen()}
      data-href={path}
      className="nav-button"
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

// Usage
<NavButton 
  route={settingsRoute} 
  params={{ tab: 'profile' }}
  icon={<SettingsIcon />}
>
  Settings
</NavButton>
```

### Route Without Parameters

```tsx
import { useLink } from '@argon-router/react';
import { homeRoute } from './routes';

function HomeButton() {
  // Pass undefined or empty object for routes without params
  const { path, onOpen } = useLink(homeRoute, undefined);

  return (
    <a href={path} onClick={(e) => {
      e.preventDefault();
      onOpen();
    }}>
      Home
    </a>
  );
}
```

### Context Menu

```tsx
import { useLink } from '@argon-router/react';
import { productRoute, editProductRoute } from './routes';

function ProductContextMenu({ productId }) {
  const viewLink = useLink(productRoute, { productId });
  const editLink = useLink(editProductRoute, { productId });

  return (
    <div className="context-menu">
      <a href={viewLink.path} onClick={(e) => {
        e.preventDefault();
        viewLink.onOpen();
      }}>
        View Product
      </a>
      <a href={editLink.path} onClick={(e) => {
        e.preventDefault();
        editLink.onOpen();
      }}>
        Edit Product
      </a>
    </div>
  );
}
```

### With Additional Navigation Options

```tsx
import { useLink } from '@argon-router/react';
import { articleRoute } from './routes';

function ArticleCard({ articleId }) {
  const { path, onOpen } = useLink(articleRoute, { articleId });

  const handleClick = (e) => {
    e.preventDefault();
    // Pass additional options to onOpen
    onOpen({
      params: { articleId },
      query: { highlight: 'true' },
      // force: true,
    });
  };

  return (
    <article>
      <h2>Article Title</h2>
      <a href={path} onClick={handleClick}>
        Read More
      </a>
    </article>
  );
}
```

### Mobile Touch Handler

```tsx
import { useLink } from '@argon-router/react';
import { pageRoute } from './routes';

function TouchableItem({ pageId, children }) {
  const { path, onOpen } = useLink(pageRoute, { pageId });

  return (
    <div
      onTouchEnd={() => onOpen()}
      role="link"
      tabIndex={0}
      data-href={path}
    >
      {children}
    </div>
  );
}
```

### Prefetching Data

```tsx
import { useLink } from '@argon-router/react';
import { productRoute } from './routes';

function ProductPreview({ productId }) {
  const { path, onOpen } = useLink(productRoute, { productId });

  const handleMouseEnter = () => {
    // Prefetch product data on hover
    fetchProductData(productId);
  };

  return (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
      onMouseEnter={handleMouseEnter}
    >
      View Product
    </a>
  );
}
```

## Error Handling

The hook will throw an error if the route is not registered in the router:

```tsx
import { useLink } from '@argon-router/react';
import { unknownRoute } from './routes';

function BrokenLink() {
  try {
    const { path, onOpen } = useLink(unknownRoute, {});
    return <a href={path} onClick={onOpen}>Link</a>;
  } catch (error) {
    // Error: Route not found. Maybe it is not passed into createRouter?
    console.error(error);
    return <span>Invalid link</span>;
  }
}
```

## Best Practices

### Prefer Built-in Link Component

For most cases, use the built-in [`Link`](/react/link) component:

```tsx
import { Link } from '@argon-router/react';

// Prefer this
<Link to={userRoute} params={{ userId: '123' }}>
  View Profile
</Link>

// Over this
function CustomLink({ userId }) {
  const { path, onOpen } = useLink(userRoute, { userId });
  return <a href={path} onClick={onOpen}>View Profile</a>;
}
```

### Use useLink When

- Building custom navigation components with special behavior
- Integrating with third-party UI libraries
- Creating non-standard interactive elements
- Need direct access to the built path

### Type Safety

The hook is fully type-safe with route parameters:

```typescript
import { createRoute } from '@argon-router/core';
import { useLink } from '@argon-router/react';

const userRoute = createRoute<{ userId: string; tab?: string }>({
  path: '/user/:userId',
});

function UserLink() {
  // ✅ Type-safe
  const link = useLink(userRoute, { userId: '123' });
  
  // ❌ TypeScript error: missing required param
  const broken = useLink(userRoute, {});
  
  // ✅ Optional params work
  const withTab = useLink(userRoute, { userId: '123', tab: 'posts' });
}
```

## See Also

- [Link](/react/link) - Built-in navigation component
- [useRouter](/react/use-router) - Access router instance
- [useIsOpened](/react/use-is-opened) - Check if route is active

