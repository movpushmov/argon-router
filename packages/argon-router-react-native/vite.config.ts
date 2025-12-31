import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

export default defineConfig({
  mode: 'production',
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'effector',
        'effector-react',
        '@argon-router/core',
        '@argon-router/react',
        '@react-navigation/native',
        '@react-navigation/bottom-tabs',
        '@react-navigation/stack',
        'react',
        'react-native',
        'react/jsx-runtime',
      ],
      output: {
        globals: {
          react: 'react',
          effector: 'effector',
          'effector-react': 'effector-react',
          '@argon-router/core': '@argon-router/core',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },

    minify: 'terser',
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      exclude: [resolve(__dirname, 'tests')],
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});
