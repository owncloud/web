const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },
  devServer: {
    contentBase: path.resolve(__dirname),
    historyApiFallback: true,
    publicPath: '/',
    filename: 'dist/core/core.bundle.js',
    watchContentBase: true,
    https: false,
    compress: true,
    host: '0.0.0.0',
    port: 8300,
    watchOptions: {
      ignored: path.resolve(__dirname, 'tests'),
    }
  }
})
