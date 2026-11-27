/**
 * Babel Config for Tomato Animes
 * Optimized for React Native + Expo with Reanimated
 */

module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
    plugins: [
      // Reanimated plugin MUST be first
      'react-native-reanimated/plugin',

      // Module resolver for path aliases
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@': './src',
            '@theme': './src/theme',
            '@components': './src/components',
            '@components/glass': './src/components/glass',
            '@navigation': './src/navigation',
            '@screens': './src/screens',
            '@services': './src/services',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@assets': './assets',
            '@native': './src/native',
          },
        },
      ],

      // Transform inline requires for better startup performance
      'react-native-reanimated/plugin',

      // Optional: Remove console.log in production
      ...(process.env.NODE_ENV === 'production' ? [
        ['transform-remove-console', { exclude: ['error', 'warn'] }],
      ] : []),
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
        ],
      },
      test: {
        presets: ['babel-preset-expo'],
        plugins: [
          'react-native-reanimated/plugin',
        ],
      },
    },
  };
};