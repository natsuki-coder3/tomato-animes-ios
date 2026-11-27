/**
 * Metro Config for Tomato Animes
 * Optimized for React Native + Expo with native modules and Reanimated
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'cjs', 'svg'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'woff', 'woff2', 'mp4', 'mov', 'mp3', 'aac', 'm4a'],
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === 'react-native-reanimated') {
            return path.resolve(__dirname, 'node_modules/react-native-reanimated');
          }
          if (name === '@shopify/react-native-skia') {
            return path.resolve(__dirname, 'node_modules/@shopify/react-native-skia');
          }
          if (name === '@tanstack/react-query') {
            return path.resolve(__dirname, 'node_modules/@tanstack/react-query');
          }
          return path.resolve(__dirname, `node_modules/${name}`);
        },
      }
    ),
    resolveRequest: (context, moduleName, platform) => {
      // Handle native module resolution
      if (moduleName.startsWith('react-native-') || moduleName.startsWith('@react-native/')) {
        return defaultConfig.resolver.resolveRequest(context, moduleName, platform);
      }
      return defaultConfig.resolver.resolveRequest(context, moduleName, platform);
    },
    blockList: [
      /.*\.test\.(ts|tsx)$/,
      /.*__tests__.*/,
      /.*__mocks__.*/,
    ],
  },
  transformer: {
    unstable_allowRequireContext: true,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
  serializer: {
    createModuleIdFactory: () => (path) => {
      const projectRoot = __dirname;
      const relativePath = path.replace(projectRoot + '/', '');
      return relativePath.replace(/\//g, '_').replace(/\./g, '_');
    },
    processModuleFilter: (module) => {
      // Exclude test files from bundle
      if (module.path.includes('__tests__') || module.path.includes('.test.')) {
        return false;
      }
      return true;
    },
  },
  watchFolders: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'assets'),
  ],
  maxWorkers: 4,
  resetCache: false,
  server: {
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return middleware(req, res, next);
      };
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);