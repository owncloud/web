const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const WebpackCopyPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
  plugins: [
    new WebpackCopyPlugin([{
      from: 'README.md',
      to: 'README.md'
    }, {
      from: 'LICENSE',
      to: 'LICENSE'
    }, {
      from: 'CHANGELOG.md',
      to: 'CHANGELOG.md'
    }, {
      from: 'manifest.json',
      to: 'manifest.json'
    }])
  ],
  mode: 'production',
  devtool: 'none',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min.js'
    }
  }
})
