const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, '../../../'),
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.svg$': 'jest-svg-transformer'
  },
  setupFiles: ['<rootDir>/tests/unit/config/jest.init.js'],
  snapshotSerializers: ['jest-serializer-vue'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,vue}',
    '<rootDir>/apps/**/src/**/*.{js,vue}',
    '!<rootDir>/**/node_modules/**'
  ]
}
