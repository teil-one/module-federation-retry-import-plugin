# @teil-one/module-federation-retry-import-plugin

A [runtime](https://module-federation.io/guide/basic/runtime.html) [Module Federation 2](https://module-federation.io) plugin for retrying remote module imports. Works in browser only.

## Motivation

The existing [Retry Plugin](https://module-federation.io/plugin/plugins/retry-plugin.html) only supports Node.js and does not work in browsers.

## Usage

At [runtime](https://module-federation.io/guide/basic/runtime.html):

```typescript
import { init } from '@module-federation/enhanced/runtime';
import { RetryImportPlugin } from '@teil-one/module-federation-retry-import-plugin';

init({
  name: 'federation_consumer',
  remotes: [],
  plugins: [
    RetryImportPlugin({
      // Returns delay before the next attempt in milliseconds or null to stop retrying
      retry: (failedAttempts) => (failedAttempts < 4 ? 200 : null), // Retry 3 times then fail.
    }),
  ],
});
```

[GitHub](https://github.com/teil-one/module-federation-retry-import-plugin) · [NPM package](https://www.npmjs.com/package/@teil-one/module-federation-retry-import-plugin)
