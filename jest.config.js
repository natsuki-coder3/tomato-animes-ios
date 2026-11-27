/**
 * Jest Config for Liquid Glass Design System
 */

module.exports = {
  preset: 'react-native',
  setupFilesAfterSetup: ['@testing-library/jest-native/extend-expect'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js|jsx)',
    '**/?(*.)+(spec|test).(ts|tsx|js|jsx)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@components/glass/(.*)$': '<rootDir>/src/components/glass/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|react-native-reanimated|@shopify/react-native-skia|react-native-gesture-handler|expo-blur|react-native-svg)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  globals: {
    __DEV__: true,
  },
  // Mock native modules
  moduleNameMapper: {
    ...require('module-name-mapper'),
  },
  // Setup files
  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],
};