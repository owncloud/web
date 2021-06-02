module.exports = {
  env: {
    browser: true,
    es6: true,
    amd: true
  },
  extends: [
    /**
     * TODO: fix promise project issues and then enable it
     * 'plugin:promise/recommended',
     */
    'standard',
    'prettier/standard',
    'plugin:prettier/recommended',
    'plugin:jest/recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  rules: {
    /**
     * TODO: fix project import issues and then enable it
     * 'sort-imports': 'warn',
     */
    'require-await': 'warn'
  },
  globals: {
    require: false,
    requirejs: false
  },
  plugins: ['jest'],
  overrides: [
    {
      files: ['**/*.vue'],
      extends: ['plugin:vue/recommended', 'prettier/vue']
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended']
    },
    {
      files: ['**/*.spec.js'],
      extends: ['plugin:jest/recommended']
    }
  ]
}
