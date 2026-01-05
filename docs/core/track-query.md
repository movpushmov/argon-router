# trackQuery

Track specific query parameters in the URL with schema validation. When the specified parameters appear in the URL and match the schema, the tracker enters; when they're removed or validation fails, it exits.

## API

```typescript
// From router
router.trackQuery<T extends ZodType>(config: QueryTrackerConfig<T>): QueryTracker<T>

// From controls
controls.trackQuery<T extends ZodType>(config: Omit<QueryTrackerConfig<T>, 'forRoutes'>): QueryTracker<T>
```

### Config

| Parameter    | Type      | Description                                                     |
| ------------ | --------- | --------------------------------------------------------------- |
| `parameters` | `ZodType` | Zod schema for query parameter validation                       |
| `forRoutes`  | `Route[]` | Optional (router only). Only track when these routes are active |

### Returns

`QueryTracker<T>` with the following properties:

| Property  | Type                                         | Description                            |
| --------- | -------------------------------------------- | -------------------------------------- |
| `enter`   | `Event<z.infer<T>>`                          | Programmatically add parameters to URL |
| `entered` | `Event<z.infer<T>>`                          | Fires when parameters match schema     |
| `exit`    | `Event<{ ignoreParams?: string[] } \| void>` | Programmatically remove parameters     |
| `exited`  | `Event<void>`                                | Fires when parameters no longer match  |

## Usage

### Basic Query Tracking

```ts
import { createRouter, createRoute } from '@argon-router/core';
import { z } from 'zod';

const searchRoute = createRoute({ path: '/search' });

const router = createRouter({
  routes: [searchRoute],
});

// Track search query parameter
const searchTracker = router.trackQuery({
  parameters: z.object({
    q: z.string(),
  }),
  forRoutes: [searchRoute],
});

// Listen when search query appears
sample({
  clock: searchTracker.entered,
  fn: (params) => console.log('Search query:', params.q),
});

// Listen when search query is removed
sample({
  clock: searchTracker.exited,
  fn: () => console.log('Search cleared'),
});
```

### Add/Remove Query Parameters

```ts
import { z } from 'zod';

const filterTracker = router.trackQuery({
  parameters: z.object({
    status: z.enum(['active', 'inactive']),
    category: z.string(),
  }),
  forRoutes: [productsRoute],
});

// Add filters to URL
filterTracker.enter({
  status: 'active',
  category: 'electronics',
});
// URL becomes: /products?status=active&category=electronics

// Remove all tracked parameters
filterTracker.exit();
// URL becomes: /products

// Remove tracked parameters but keep others
filterTracker.exit({ ignoreParams: ['page'] });
// Removes status and category, keeps page param
```

### Pagination

```ts
import { z } from 'zod';

const paginationTracker = router.trackQuery({
  parameters: z.object({
    page: z.string().regex(/^\d+$/),
    limit: z.string().regex(/^\d+$/),
  }),
  forRoutes: [listRoute],
});

// Go to page 2
paginationTracker.enter({ page: '2', limit: '20' });

// Reset to first page
paginationTracker.exit();
```

### Optional Parameters

```ts
import { z } from 'zod';

const advancedSearchTracker = router.trackQuery({
  parameters: z.object({
    q: z.string(),
    tags: z.array(z.string()).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
  }),
  forRoutes: [searchRoute],
});

// Required query only
advancedSearchTracker.enter({ q: 'laptop' });

// With optional parameters
advancedSearchTracker.enter({
  q: 'laptop',
  tags: ['electronics', 'computers'],
  minPrice: '500',
  maxPrice: '2000',
});
```

### Multiple Trackers

```ts
import { z } from 'zod';

// Track search independently
const searchTracker = router.trackQuery({
  parameters: z.object({ q: z.string() }),
  forRoutes: [searchRoute],
});

// Track filters independently
const filterTracker = router.trackQuery({
  parameters: z.object({
    category: z.string(),
    status: z.string(),
  }),
  forRoutes: [searchRoute],
});

// Track sort independently
const sortTracker = router.trackQuery({
  parameters: z.object({
    sort: z.enum(['asc', 'desc']),
    sortBy: z.string(),
  }),
  forRoutes: [searchRoute],
});

// Each tracker manages its own parameters
searchTracker.enter({ q: 'phone' });
filterTracker.enter({ category: 'mobile', status: 'active' });
sortTracker.enter({ sort: 'asc', sortBy: 'price' });
// URL: /search?q=phone&category=mobile&status=active&sort=asc&sortBy=price
```

### With Router Controls

```ts
import { createRouterControls } from '@argon-router/core';
import { z } from 'zod';

const controls = createRouterControls();

// trackQuery from controls doesn't support forRoutes
const themeTracker = controls.trackQuery({
  parameters: z.object({
    theme: z.enum(['light', 'dark']),
  }),
});

// Theme parameter works on all routes
themeTracker.enter({ theme: 'dark' });
```

### React Integration

```tsx
import { useUnit } from 'effector-react';
import { z } from 'zod';

const filterTracker = router.trackQuery({
  parameters: z.object({
    search: z.string(),
    category: z.string().optional(),
  }),
  forRoutes: [productsRoute],
});

function ProductFilters() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const handleApplyFilters = () => {
    filterTracker.enter({
      search,
      ...(category && { category }),
    });
  };

  const handleClearFilters = () => {
    filterTracker.exit();
    setSearch('');
    setCategory('');
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>
      <button onClick={handleApplyFilters}>Apply</button>
      <button onClick={handleClearFilters}>Clear</button>
    </div>
  );
}
```

### Load Data on Query Change

```ts
import { sample } from 'effector';
import { z } from 'zod';

const searchTracker = router.trackQuery({
  parameters: z.object({
    q: z.string(),
    page: z.string().optional(),
  }),
  forRoutes: [searchRoute],
});

const loadSearchResultsFx = createEffect(
  async (params: { q: string; page?: string }) => {
    return await fetchSearchResults(params);
  },
);

// Load results when search query is entered
sample({
  clock: searchTracker.entered,
  target: loadSearchResultsFx,
});

// Clear results when search is exited
sample({
  clock: searchTracker.exited,
  target: $searchResults.reinit,
});
```

### Validation Handling

```ts
import { z } from 'zod';

const strictPaginationTracker = router.trackQuery({
  parameters: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .refine((val) => parseInt(val) > 0),
    limit: z.enum(['10', '20', '50', '100']),
  }),
  forRoutes: [listRoute],
});

// ✅ Valid - tracker enters
// URL: /list?page=1&limit=20

// ❌ Invalid - tracker won't enter or will exit
// URL: /list?page=0&limit=20      (page must be > 0)
// URL: /list?page=abc&limit=20    (page must be number)
// URL: /list?page=1&limit=30      (limit must be 10/20/50/100)
```

## How It Works

1. **Validation**: Continuously validates current query parameters against the schema
2. **Entered**: When parameters match the schema, `entered` fires with validated data
3. **Exited**: When parameters no longer match (removed or invalid), `exited` fires
4. **Route Filtering**: If `forRoutes` is specified, only tracks when those routes are active

## Best Practices

### Use Specific Schemas

Define precise validation rules:

```ts
// ✅ Good: Specific validation
const tracker = router.trackQuery({
  parameters: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .refine((val) => parseInt(val) > 0),
    sortBy: z.enum(['name', 'date', 'price']),
  }),
  forRoutes: [listRoute],
});

// ❌ Bad: Too permissive
const tracker = router.trackQuery({
  parameters: z.object({
    page: z.any(),
    sortBy: z.string(),
  }),
  forRoutes: [listRoute],
});
```

### Scope to Routes

Only track query parameters for relevant routes:

```ts
// ✅ Good: Scoped to search route
const searchTracker = router.trackQuery({
  parameters: z.object({ q: z.string() }),
  forRoutes: [searchRoute],
});

// ❌ Bad: Tracks on all routes (unless intended)
const searchTracker = controls.trackQuery({
  parameters: z.object({ q: z.string() }),
});
```

### Separate Concerns

Create separate trackers for different parameter groups:

```ts
// ✅ Good: Separate trackers for independent concerns
const searchTracker = router.trackQuery({
  parameters: z.object({ q: z.string() }),
  forRoutes: [searchRoute],
});

const paginationTracker = router.trackQuery({
  parameters: z.object({ page: z.string() }),
  forRoutes: [searchRoute],
});

// ❌ Bad: Mixed concerns
const mixedTracker = router.trackQuery({
  parameters: z.object({
    q: z.string(),
    page: z.string(),
    theme: z.string(),
  }),
  forRoutes: [searchRoute],
});
```

## See Also

- [createRouter](/core/create-router) - Create router with trackQuery
- [createRouterControls](/core/create-router-controls) - Create controls with trackQuery
