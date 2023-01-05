import path from 'path'
import { compilerOptions } from '../../../vite.config'
const rootDir = path.resolve(__dirname, '../../../')

// We need to transpile these modules as they are using esm syntax
const esmModules = ['lodash-es'].map((m) => `.pnpm/${m}@.*`)
process.env.TZ = 'GMT'
module.exports = {
  globals: {
    'vue-jest': {
      compilerOptions
    }
  },
  rootDir,
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/tests/unit/stubs/empty.js',
    '^@/(.*)$': '<rootDir>/$1',
    'core-js': '<rootDir>/node_modules/core-js',
    '^vue$': '@vue/compat',

    // HACK: workaround for https://github.com/transloadit/uppy/issues/4127
    '@uppy/core': '<rootDir>tests/unit/stubs/uppy',
    '@uppy/xhr-upload': '<rootDir>tests/unit/stubs/uppy',
    '@uppy/drop-target': '<rootDir>tests/unit/stubs/uppy',
    '@uppy/tus': '<rootDir>tests/unit/stubs/uppy',
    '@uppy/utils': '<rootDir>tests/unit/stubs/uppy',

    // FIXME: can be removed when is https://github.com/owncloud/web/pull/8136
    // remove function.ts as well
    'copy-to-clipboard': '<rootDir>tests/unit/stubs/function'
  },
  modulePathIgnorePatterns: ['packages/design-system/docs/'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esmModules.join('|')})`],
  setupFiles: [
    '<rootDir>/tests/unit/config/jest.init.js',
    '<rootDir>/tests/unit/config/jest.overrides.js',
    'core-js'
  ],
  snapshotSerializers: ['jest-serializer-vue-tjw'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov'],
  collectCoverageFrom: [
    '<rootDir>/packages/**/src/**/*.{js,ts,vue}',
    '!<rootDir>/**/node_modules/**'
  ],
  testMatch: ['**/*.spec.{js,ts}'],
  testPathIgnorePatterns: ['<rootDir>/.pnpm-store/*'],
  clearMocks: true
}
