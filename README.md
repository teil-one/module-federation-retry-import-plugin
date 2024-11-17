# @teil-one/module-federation-retry-import-plugin

A runtime Module Federation 2 plugin for retrying remote module imports. Works in browser only.

## Usage

At runtime:

```
import { init } from '@module-federation/enhanced/runtime';
import { RetryImportPlugin } from '@teil-one/module-federation-retry-import-plugin';

init({
  name: 'federation_consumer',
  remotes: [],
  plugins: [
    RetryImportPlugin(),
  ],
});
```
