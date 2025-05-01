---
title: Choosing router
---

# Choosing Between `atomic-router` and `argon-router` in effector

## Overview

When working with the effector state manager, you have two main routing options:

1. **`atomic-router`** - The established, stable routing solution
2. **`argon-router`** - A newer alternative with additional features

## Key Differences

| Feature                 | `atomic-router`       | `argon-router`        |
| ----------------------- | --------------------- | --------------------- |
| Route definition        | Separated from path   | Combined with path    |
| Query parameters        | Basic support         | Advanced `trackQuery` |
| Lazy routes             | Manual implementation | Built-in support      |
| Framework compatibility | React, Solid & Forest | React-only (for now)  |
| Chain routing           | ✅ Yes                | ✅ Yes                |
| Path/query writing      | ✅ Yes                | ✅ Yes                |

## When to Choose `argon-router`

Consider `argon-router` if you:

- Are building a React application
- Need advanced query parameter handling
- Want built-in lazy route loading
- Prefer defining routes and paths together
- Like a more integrated approach

Example `argon-router` route definition:

```js
const homeRoute = createRoute({
  path: '/home',
});
```

## When to Choose `atomic-router`

Stick with `atomic-router` if you:

- Need agnostic routing
- Prefer separation of route and path definitions
- Want a more minimalistic approach
- Need a battle-tested solution
- Don't require advanced query parameter features

Example `atomic-router` route definition:

```js
const homeRoute = createRoute();

const router = createRouter({ routes: [{ route: homeRoute, path: '/home' }] });
```

## Migration Considerations

If you're considering switching from `atomic-router` to `argon-router`:

1. You'll need to combine route and path definitions
2. Query parameter handling will need updating
3. You gain lazy loading capabilities
4. Your app becomes React-specific, other bindings are not ready yet.

## Performance

Both routers are lightweight and performant, with `argon-router` having slightly more overhead due to its additional features.

## Community & Support

- `atomic-router` has been around longer and has more community resources
- `argon-router` is newer but actively maintained

## Final Recommendation

**Choose `argon-router` for new React projects** where you want more built-in features. **Stick with `atomic-router`** for framework-agnostic needs or existing projects where migration would be costly.
