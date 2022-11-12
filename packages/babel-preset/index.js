const { declare } = require('@babel/helper-plugin-utils')

module.exports = declare((api, options) => {
  return {
    plugins: ['@babel/plugin-transform-runtime'],
    presets: [
      [
        require('@babel/preset-env'),
        {
          useBuiltIns: 'usage',
          shippedProposals: true,
          corejs: {
            version: 3,
            proposals: true
          }
        }
      ]
    ]
  }
})
