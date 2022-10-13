const path = require('path')
const rootDir = path.resolve(__dirname, '../../../')

module.exports = {
  rootDir,
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': ['babel-jest', { configFile: path.join(rootDir, '.babelrc') }],
    '.*\\.(vue)$': 'vue-jest'
  },
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/tests/unit/stubs/empty.js',
    '^@/(.*)$': '<rootDir>/$1',
    '^@files/(.*)$': '<rootDir>/packages/web-app-files/$1',
    '@vue/composition-api': '<rootDir>/node_modules/@vue/composition-api',
    'core-js': '<rootDir>/node_modules/core-js',

    // HACK: workaround for https://github.com/transloadit/uppy/issues/4127
    '@uppy/core': '<rootDir>tests/unit/mocks/uppy',
    '@uppy/xhr-upload': '<rootDir>tests/unit/mocks/uppy',
    '@uppy/drop-target': '<rootDir>tests/unit/mocks/uppy',
    '@uppy/tus': '<rootDir>tests/unit/mocks/uppy'
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es|@uppy)'],
  setupFiles: ['<rootDir>/tests/unit/config/jest.init.js', 'core-js'],
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
