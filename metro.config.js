const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  FailedToResolveNameError,
  FailedToResolvePathError,
} = require('metro-resolver');

const projectRoot = __dirname;

function resolveBarePackageViaNode(specifier) {
  if (
    specifier.startsWith('.') ||
    path.isAbsolute(specifier) ||
    specifier.includes('\0')
  ) {
    return null;
  }
  try {
    const filePath = require.resolve(specifier, {paths: [projectRoot]});
    return {filePath, type: 'sourceFile'};
  } catch {
    return null;
  }
}

function isMetroResolutionFailure(error) {
  return (
    error instanceof FailedToResolveNameError ||
    error instanceof FailedToResolvePathError ||
    /FailedToResolve(Name|Path)Error/.test(error?.constructor?.name ?? '')
  );
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot,
  watchFolders: [projectRoot],
  resolver: {
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules')],
    resolveRequest(context, moduleName, platform) {
      const jsxRuntime =
        moduleName === 'react/jsx-runtime' ||
        moduleName === 'react/jsx-dev-runtime';
      if (jsxRuntime) {
        const resolved = resolveBarePackageViaNode(moduleName);
        if (resolved) {
          return resolved;
        }
      }

      try {
        return context.resolveRequest(context, moduleName, platform);
      } catch (error) {
        if (isMetroResolutionFailure(error)) {
          const fallback = resolveBarePackageViaNode(moduleName);
          if (fallback) {
            return fallback;
          }
        }
        throw error;
      }
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
