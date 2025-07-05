import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  mode: 'production',
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'EffectorReformVue',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'effector',
        'effector-vue',
        'effector-vue/composition',
        'vue',
        '@effector-reform/core',
      ],
      output: {
        globals: {
          react: 'react',
          effector: 'effector',
          'effector-vue': 'effector-vue',
          'effector-vue/composition': 'effector-vue/composition',
          '@effector-reform/core': '@effector-reform/core',
          vue: 'vue',
        },
      },
    },

    minify: 'terser',
  },
  plugins: [
    vue(),
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'lib'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
