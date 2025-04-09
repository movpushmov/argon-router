# ☄️ argon-router/paths

Exteremly customizable paths without a headache

> [!WARNING]
> argon-router is not production ready yet and still may have bugs and unstable API. If you found bug — please report it on GitHub.

## Documentation

For additional information, guides and api reference visit [documentation site](https://movpushmov.dev/argon-router/)

## Packages

- [@argon-router/core](https://www.npmjs.com/package/@argon-router/core)
- [@argon-router/react](https://www.npmjs.com/package/@argon-router/react)
- [@argon-router/paths](https://www.npmjs.com/package/@argon-router/paths)

## Installation

```
npm i @argon-router/paths
```

## Supported types

- String parameter

```ts
'/:id'; // same as '/something'
```

- String parameters array

```ts
'/:id+'; // same as '/something', '/something/went' and etc
```

- String parameters array with possible zero length

```ts
'/:id*'; // same as '/', '/something', '/something/went' and etc
```

- Nullable parameter

```ts
'/:id?'; // same as '/' and '/test'
```

- Generic parameter (numbers)

```ts
'/:id<number>'; // same as '/123' and not '/test'
```

- Nullable generic parameter (numbers)

```ts
'/:id<number>?'; // same as '/123', '/' and not '/test'
```

- Generic parameter (string literals)

```ts
'/:id<hello|world>'; // same as '/hello', '/world' and not '/test'
```

- Ranges for parameter

```ts
'/:id{2,3}'; // same as '/test/test', '/test/test/test' and not '/test'
```
