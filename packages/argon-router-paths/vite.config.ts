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
    minify: 'terser',
  },
  plugins: [
    babel({ filter: /.[jt]sx?/ }),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {},
});
