const path = require('path')
const rootDir = path.resolve(__dirname, '../../../')

// We need to transpile these modules as they are using esm syntax
const esmModules = ['lodash-es'].map((m) =>
  process.env.npm_config_user_agent?.startsWith('pnpm') ? `.pnpm/${m}@.*` : m
)

module.exports = {
  rootDir,
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue2-jest'
  },
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/tests/unit/stubs/empty.js',
    '^@/(.*)$': '<rootDir>/$1',
    'core-js': '<rootDir>/node_modules/core-js',

    // HACK: workaround for https://github.com/transloadit/uppy/issues/4127
    '@uppy/core': '<rootDir>tests/unit/stubs/uppy',
    '@uppy/xhr-upload': '<rootDir>tests/unit/stubs/uppy',
    '@uppy/drop-target': '<rootDir>tests/unit/stubs/uppy',
    '@uppy/tus': '<rootDir>tests/unit/stubs/uppy'
  },
  modulePathIgnorePatterns: ['packages/design-system/docs/utils/statusLabels.spec.js'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esmModules.join('|')})`],
  setupFiles: [
    '<rootDir>/tests/unit/config/jest.init.js',
    '<rootDir>/tests/unit/config/jest.overrides.js',
    'core-js'
  ],
  snapshotSerializers: ['jest-serializer-vue'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov'],
  collectCoverageFrom: [
    '<rootDir>/packages/**/src/**/*.{js,ts,vue}',
    '!<rootDir>/**/node_modules/**'
  ],
  testMatch: ['**/*.spec.{js,ts}'],
  clearMocks: true
}
