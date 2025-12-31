import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import babel from 'vite-plugin-babel';

export default defineConfig({
  mode: 'production',
  build: {
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'effector',
        'patronum',
        'effector-action',
        '@argon-router/paths',
        'query-string',
      ],
      output: {
        globals: {
          effector: 'effector',
          patronum: 'patronum',
          'query-string': 'query-string',
        },
      },
    },
    minify: 'terser',
  },
  plugins: [
    babel({ filter: /.[jt]sx?/ }),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      exclude: [resolve(__dirname, 'tests')],
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {
    setupFiles: [resolve(__dirname, 'tests/setup.ts')],
  },
});
