# Paths

The `@argon-router/paths` package provides powerful path parsing and building utilities with full TypeScript type inference.

## Overview

`@argon-router/paths` is a standalone library for working with URL paths. It compiles path patterns into parser and builder functions with automatic parameter type extraction.

**Key features:**

- **Type-Safe** - Full TypeScript inference of path parameters
- **Flexible** - Support for strings, numbers, unions, and arrays
- **Modifiers** - Optional (`?`), repeating (`+`, `*`), and range (`{min,max}`) parameters
- **Validation** - Runtime validation of path parameters
- **Standalone** - Can be used independently or with `@argon-router/core`

## Installation

```bash
npm install @argon-router/paths
```

## Quick Start

```ts
import { compile } from '@argon-router/paths';

// Compile a path pattern
const { parse, build } = compile('/user/:id<number>');

// Parse a path
const result = parse('/user/123');
// { path: '/user/123', params: { id: 123 } }

// Build a path
const path = build({ id: 456 });
// '/user/456'
```

## Parameter Types

### String Parameters (Default)

```ts
const { parse, build } = compile('/user/:name');
//                                        ^- { name: string }

build({ name: 'john' }); // '/user/john'
parse('/user/jane'); // { path: '/user/jane', params: { name: 'jane' } }
```

### Number Parameters

```ts
const { parse, build } = compile('/post/:id<number>');
//                                        ^- { id: number }

build({ id: 123 }); // '/post/123'
parse('/post/456'); // { path: '/post/456', params: { id: 456 } }
parse('/post/abc'); // null (validation failed)
```

### Union Parameters

```ts
const { parse, build } = compile('/edit/:mode<create|update|delete>');
//                                        ^- { mode: 'create' | 'update' | 'delete' }

build({ mode: 'create' }); // '/edit/create'
parse('/edit/update'); // { path: '/edit/update', params: { mode: 'update' } }
parse('/edit/other'); // null (not in union)
```

### Multiple Parameters

```ts
const { parse, build } = compile('/blog/:year<number>/:month<number>/:slug');
//                                        ^- { year: number; month: number; slug: string }

build({ year: 2024, month: 1, slug: 'hello-world' });
// '/blog/2024/1/hello-world'

parse('/blog/2024/12/typescript-tips');
// { path: '/blog/2024/12/typescript-tips', params: { year: 2024, month: 12, slug: 'typescript-tips' } }
```

## Parameter Modifiers

### Optional Parameters (`?`)

```ts
const { parse, build } = compile('/user/:id?');
//                                        ^- { id?: string }

build({}); // '/user'
build({ id: '123' }); // '/user/123'

parse('/user'); // { path: '/user', params: {} }
parse('/user/456'); // { path: '/user/456', params: { id: '456' } }
```

### Optional with Type

```ts
const { parse, build } = compile('/post/:id<number>?');
//                                        ^- { id?: number }

build({}); // '/post'
build({ id: 123 }); // '/post/123'
```

### Repeating Parameters (`+`)

One or more values:

```ts
const { parse, build } = compile('/category/:tags+');
//                                          ^- { tags: string[] }

build({ tags: ['js'] }); // '/category/js'
build({ tags: ['js', 'ts', 'react'] }); // '/category/js/ts/react'

parse('/category/javascript'); // { path: '...', params: { tags: ['javascript'] } }
parse('/category/js/typescript'); // { path: '...', params: { tags: ['js', 'typescript'] } }
parse('/category'); // null (requires at least one)
```

### Zero or More Parameters (`*`)

```ts
const { parse, build } = compile('/files/:path*');
//                                        ^- { path: string[] }

build({ path: [] }); // '/files'
build({ path: ['docs', 'api', 'index'] }); // '/files/docs/api/index'

parse('/files'); // { path: '/files', params: { path: [] } }
parse('/files/src/utils'); // { path: '...', params: { path: ['src', 'utils'] } }
```

### Range Parameters (`{min,max}`)

Specify exact ranges:

```ts
const { parse, build } = compile('/path/:segments{2,3}');
//                                       ^- { segments: string[] }

build({ segments: ['a', 'b'] }); // '/path/a/b'
build({ segments: ['a', 'b', 'c'] }); // '/path/a/b/c'
build({ segments: ['a'] }); // Error: must have 2-3 items

parse('/path/x/y'); // { path: '...', params: { segments: ['x', 'y'] } }
parse('/path/x/y/z'); // { path: '...', params: { segments: ['x', 'y', 'z'] } }
parse('/path/x'); // null (need 2-3 segments)
parse('/path/w/x/y/z'); // null (max 3 segments)
```

### Combining Modifiers

```ts
// Optional range
const { parse, build } = compile('/items/:ids<number>{1,3}?');
//                                         ^- { ids?: number[] }

build({}); // '/items'
build({ ids: [1, 2] }); // '/items/1/2'

// Range with type
const { parse, build } = compile('/tag/:names<create|update|delete>{2,2}');
//                                       ^- { names: ('create' | 'update' | 'delete')[] }

build({ names: ['create', 'delete'] }); // '/tag/create/delete'
```

## TypeScript Integration

All parameter types are automatically inferred:

```ts
import { compile, ParseUrlParams } from '@argon-router/paths';

// Extract parameter types
type UserParams = ParseUrlParams<'/user/:id<number>'>;
//   ^- { id: number }

type BlogParams = ParseUrlParams<'/blog/:year<number>/:month<number>/:slug'>;
//   ^- { year: number; month: number; slug: string }

type TagsParams = ParseUrlParams<'/tags/:items+'>;
//   ^- { items: string[] }

type OptionalParams = ParseUrlParams<'/post/:id?'>;
//   ^- { id?: string }

// Use with compile
const { build, parse } = compile('/user/:id<number>');

// ✅ Type-safe
build({ id: 123 });

// ❌ TypeScript error
build({ id: '123' }); // Expected number, got string
build({}); // Missing required parameter
```

## Advanced Examples

### File Path with Wildcard

```ts
const { parse, build } = compile('/files/:path*');

function serveFile(url: string) {
  const result = parse(url);
  if (!result) return null;

  const filePath = result.params.path.join('/');
  return readFile(filePath);
}

serveFile('/files/docs/api/routes.md');
// Reads: docs/api/routes.md
```

### API Version Routing

```ts
const { parse, build } = compile('/api/:version<v1|v2|v3>/:resource');

function routeApiRequest(url: string) {
  const result = parse(url);
  if (!result) return null;

  const { version, resource } = result.params;
  return routeToHandler(version, resource);
}
```

### Breadcrumb Navigation

```ts
const { parse, build } = compile('/:segments+');

function generateBreadcrumbs(url: string) {
  const result = parse(url);
  if (!result) return [];

  return result.params.segments.map((segment, index) => ({
    label: segment,
    path: build({ segments: result.params.segments.slice(0, index + 1) }),
  }));
}

generateBreadcrumbs('/products/electronics/laptops');
// [
//   { label: 'products', path: '/products' },
//   { label: 'electronics', path: '/products/electronics' },
//   { label: 'laptops', path: '/products/electronics/laptops' }
// ]
```

### Date-based Routes

```ts
const { parse, build } = compile(
  '/archive/:year<number>/:month<number>?/:day<number>?',
);

function buildArchiveUrl(date: Date) {
  return build({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

buildArchiveUrl(new Date('2024-01-15')); // '/archive/2024/1/15'
```

## Best Practices

### Validate Before Building

```ts
const { build, parse } = compile('/user/:id<number>');

function navigateToUser(id: unknown) {
  // Validate at runtime
  if (typeof id !== 'number') {
    throw new Error('Invalid user ID');
  }

  return build({ id });
}
```

### Handle Parse Failures

```ts
const { parse } = compile('/post/:id<number>');

function getPostId(url: string): number | null {
  const result = parse(url);
  return result ? result.params.id : null;
}
```

### Use Type Extraction

```ts
import { ParseUrlParams } from '@argon-router/paths';

// Define path template
const USER_PATH = '/user/:id<number>/profile' as const;
type UserPathParams = ParseUrlParams<typeof USER_PATH>;

// Use in functions
function buildUserUrl(params: UserPathParams) {
  const { build } = compile(USER_PATH);
  return build(params);
}
```

### Reuse Compiled Patterns

```ts
// ✅ Good: Compile once, reuse many times
const userPath = compile('/user/:id<number>');

function parseUser(url: string) {
  return userPath.parse(url);
}

function buildUser(id: number) {
  return userPath.build({ id });
}

// ❌ Bad: Compiling every time
function parseUser(url: string) {
  const { parse } = compile('/user/:id<number>');
  return parse(url);
}
```

## Path Conversion

### `convertPath(path, mode)`

Convert paths from argon-router format to express or other path format.

**Parameters:**

- `path: string` - The path to convert
- `mode: 'express'` - The result format

**Returns:** `string` - The converted path

```ts
import { convertPath } from '@argon-router/paths';

// Convert argon-router patterns to Express format
convertPath('/user/:id<.+>', 'express');
// '/user/:id'

convertPath('/files/:id+', 'express');
// '/files/*id'

convertPath('/files/:id*', 'express');
// '/files/*id'

convertPath('/files/:id{.+}', 'express');
// '/files/*id'

// Convert optional parameters
convertPath('/user/:id?', 'express');
// '/user/{:id}'

convertPath('/:id?', 'express');
// '{:id}'

// Nested optional parameters
convertPath('/api/:version?/*path?', 'express');
// '/api{/:version}/{/*path}'
```

### Argon-Router to Express Conversion

When you need to use argon-router paths with Express.js or generate Express-compatible routes, use `convertPath`:

| Argon-Router Pattern | Express Pattern | Description              |
| -------------------- | --------------- | ------------------------ |
| `:id<.+>`            | `:id`           | Removes regex patterns   |
| `:id+`               | `*id`           | One or more → wildcard   |
| `:id*`               | `*id`           | Zero or more → wildcard  |
| `:id{.+}`            | `*id`           | Custom regex → wildcard  |
| `:id?`               | `{:id}`         | Wraps optional params    |
| `*id?`               | `{*id}`         | Wraps optional wildcards |

**Example usage:**

```ts
import { convertPath } from '@argon-router/paths';

// Argon-router paths with advanced features
const argonPaths = [
  '/users/:id<number>',
  '/files/:path+',
  '/api/:version?/:resource',
];

// Convert to Express-compatible format
const expressPaths = argonPaths.map((path) => convertPath(path, 'express'));

// Use with Express.js
import express from 'express';
const app = express();

expressPaths.forEach((path) => {
  app.get(path, (req, res) => {
    // Handle request
  });
});
```

## API Reference

### `compile<T>(path: T)`

Compile a path pattern into parser and builder functions.

**Parameters:**

- `path: string` - The path pattern to compile

**Returns:**

```typescript
{
  parse: (path: string) => { path: string; params: Params } | null;
  build: (params: Params) => string;
}
```

### `convertPath(path: string, mode: 'express')`

Convert an argon-router path pattern to another router format.

**Parameters:**

- `path: string` - The argon-router path pattern to convert
- `mode: 'express'` - The target router format

**Returns:** `string` - The converted path pattern in the target format

### `ParseUrlParams<T>`

Type utility to extract parameter types from a path template.

```typescript
type Params = ParseUrlParams<'/user/:id<number>'>;
// { id: number }
```

## See Also

- [createRoute](/core/create-route) - Use with argon-router
- [createRouter](/core/create-router) - Router with path compilation
