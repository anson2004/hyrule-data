import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'locales/zh': 'src/locales/zh.ts',
    'locales/nl': 'src/locales/nl.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2022',
});
