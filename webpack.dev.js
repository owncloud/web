const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
  plugins: [
    new CopyWebpackPlugin([{
      from: './config.json',
      to: path.resolve(__dirname, 'dist')
    }])
  ],
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    historyApiFallback: true,
    publicPath: '/',
    filename: "core/core.bundle.js",
    watchContentBase: true,
    https: false,
    compress: true,
    port: 8300
  }
});
