const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

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
    // workaround for webpack-dev-server issue, which works around sockjs issue
    // for bug status, see https://github.com/webpack/webpack-dev-server/issues/1604
    // we should enable hostCheck in near future...
    disableHostCheck: true,
    publicPath: '/core/',
    filename: 'js/core.bundle.js',
    watchContentBase: true,
    https: false,
    compress: true,
    port: 8300
  }
})
