import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';
import { reactNative } from '@srsholmes/vitest-react-native';

export default defineConfig({
  mode: 'production',
  resolve: {
    dedupe: ['effector', 'effector-react', 'react', 'react/jsx-runtime'],
  },
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
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    reactNative(),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      exclude: [
        resolve(__dirname, 'tests'),
        resolve(__dirname, '../argon-router-paths'),
        resolve(__dirname, '../argon-router-core'),
        resolve(__dirname, '../argon-router-react'),
      ],
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
});
