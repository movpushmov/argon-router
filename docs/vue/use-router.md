# useRouter

Get router in react component. Works only inside `<RouterProvider>`

### Example

```tsx
function App() {
  const { path, query } = useRouter();

  // ... do something with path & query ...

  return <>...</>;
}
```
