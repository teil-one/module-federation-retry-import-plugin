import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      dts: {
        bundle: false,
        distPath: 'dist',
      },
      format: 'esm',
      output: {
        distPath: {
          root: 'dist',
        },
        target: 'web',
        minify: true,
        sourceMap: {
          js: 'cheap-module-source-map',
        },
      },
    },
    {
      dts: {
        bundle: false,
        distPath: 'dist',
      },
      format: 'cjs',
      output: {
        distPath: {
          root: 'dist',
        },
        target: 'web',
        minify: true,
        sourceMap: {
          js: 'cheap-module-source-map',
        },
      },
    },
  ],
});
