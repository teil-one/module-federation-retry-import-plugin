import type {
  FederationRuntimePlugin,
  RemoteEntryExports,
  RemoteInfo,
} from '@module-federation/runtime/types';

import { loadScript, isBrowserEnv } from '@module-federation/sdk';

export function RetryImportPlugin(): FederationRuntimePlugin {
  return {
    name: 'retry-import-plugin',
    async loadEntry({ remoteInfo, remoteEntryExports }) {
      if (remoteEntryExports) {
        return remoteEntryExports;
      }

      if (!isBrowserEnv()) {
        throw new Error('Node is not supported by this plugin');
      }

      return loadWithRetry(remoteInfo, remoteEntryExports);
    },
  };
}

async function loadWithRetry(
  remoteInfo: RemoteInfo,
  remoteEntryExports: RemoteEntryExports | undefined,
) {
  const { entry, entryGlobalName, name, type } = remoteInfo;

  let module;
  let attempt = 0;

  let entryUrl = entry;

  while (attempt < 3) {
    try {
      module = await load(
        entryUrl,
        entryGlobalName,
        name,
        type,
        remoteEntryExports,
      );
    } catch (e) {
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        entryUrl += '#'; // Change the URL. Otherwise, browser won't retry the import
      } else {
        throw e;
      }
    }

    attempt++;
  }

  return module as RemoteEntryExports;
}

function load(
  entry: string,
  globalName: string,
  name: string,
  type: string,
  remoteEntryExports: RemoteEntryExports | undefined,
) {
  switch (type) {
    case 'esm':
    case 'module':
      return loadEsmEntry({ entry, remoteEntryExports });
    case 'system':
      return loadSystemJsEntry({ entry, remoteEntryExports });
    default:
      return loadEntryScript({ entry, globalName, name });
  }
}

async function loadEsmEntry({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}) {
  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  return await import(entry);
}

async function loadSystemJsEntry({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports> {
  return new Promise<RemoteEntryExports>((resolve, reject) => {
    try {
      if (!remoteEntryExports) {
        // @ts-expect-error System import
        if (typeof __system_context__ === 'undefined') {
          // @ts-expect-error System import
          System.import(entry).then(resolve).catch(reject);
        } else {
          new Function(
            'callbacks',
            `System.import("${entry}").then(callbacks[0]).catch(callbacks[1])`,
          )([resolve, reject]);
        }
      } else {
        resolve(remoteEntryExports);
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function loadEntryScript({
  name,
  globalName,
  entry,
}: {
  name: string;
  globalName: string;
  entry: string;
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  return loadScript(entry, {
    attrs: {},
  })
    .then(() => {
      const { remoteEntryKey, entryExports } = getRemoteEntryExports(
        name,
        globalName,
      );

      if (!entryExports) {
        const msg = `Could not get remote entry exports. Remote name: ${name}, remote URL: ${entry}, remote key: ${remoteEntryKey}`;
        throw new Error(`[ Retry Import Plugin ]: ${msg}`);
      }

      return entryExports;
    })
    .catch((e) => {
      throw e;
    });
}

function getRemoteEntryExports(
  name: string,
  globalName: string | undefined,
): {
  remoteEntryKey: string;
  entryExports: RemoteEntryExports | undefined;
} {
  const remoteEntryKey = globalName || `__FEDERATION_${name}:custom__`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entryExports = (globalThis as any)[remoteEntryKey];
  return {
    remoteEntryKey,
    entryExports,
  };
}
