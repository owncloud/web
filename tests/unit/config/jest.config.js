const path = require('path')
const rootDir = path.resolve(__dirname, '../../../')

module.exports = {
  rootDir,
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': ['babel-jest', { configFile: path.join(rootDir, '.babelrc') }],
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.svg$': 'jest-svg-transformer'
  },
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/tests/unit/stubs/empty.js',
    '^@/(.*)$': '<rootDir>/$1',
    '^@files/(.*)$': '<rootDir>/packages/web-app-files/$1'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
  setupFiles: ['<rootDir>/tests/unit/config/jest.init.js', 'core-js'],
  snapshotSerializers: ['jest-serializer-vue'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov'],
  collectCoverageFrom: [
    '<rootDir>/packages/**/src/**/*.{js,ts,vue}',
    '!<rootDir>/**/node_modules/**'
  ],
  modulePathIgnorePatterns: ['integration']
}
