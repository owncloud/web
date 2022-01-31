const path = require('path')
const rootDir = path.resolve(__dirname, '../../../')

module.exports = {
  rootDir,
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': ['babel-jest', { configFile: path.join(rootDir, '.babelrc') }],
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/file.js'
  },
  moduleNameMapper: {
    '^.+\\.(css|scss)$': 'babel-jest',
    '^@runtime/(.*)$': '<rootDir>/packages/web-runtime/$1',
    '^@pkg/(.*)$': '<rootDir>/packages/web-pkg/$1',
    '^@files/(.*)$': '<rootDir>/packages/web-app-files/$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^core-js/(.*)$': '<rootDir>/node_modules/core-js/$1'
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
  setupFiles: ['<rootDir>/tests/integration/config/jest.init.js'],
  snapshotSerializers: ['jest-serializer-vue'],
  coverageDirectory: '<rootDir>/coverage/integration',
  coverageReporters: ['lcov'],
  collectCoverageFrom: ['<rootDir>/packages/**/src/**/*.{js,vue}', '!<rootDir>/**/node_modules/**'],
  testMatch: ['**/tests/integration/specs/**/*.spec.js']
}
