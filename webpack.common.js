const path = require('path')
const fs = require('fs')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const WebpackCopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const appFolder = path.resolve(__dirname, 'apps')
let apps = []
var config

if (fs.existsSync('config.json')) {
  config = require('./config.json')
} else {
  config = require('./tests/drone/config.json')
}

config.apps
  .forEach(function (mod) {
    if (fs.existsSync(path.resolve(appFolder, mod))) {
      var modPath = {
        from: path.resolve('apps', mod, 'dist'),
        to: path.resolve(__dirname, 'dist', 'apps', mod)
      }
      apps.push(modPath)
    }
  })

const src_files = [{
  from: path.resolve(__dirname, 'themes/**'),
  to: path.resolve(__dirname, 'dist')
}, {
  from: path.resolve(__dirname, 'node_modules', 'requirejs', 'require.js'),
  to: path.resolve(__dirname, 'dist', 'node_modules', 'requirejs')
}]
for (file of src_files) {
  apps.push(file)
}
apps.push({
  from: path.resolve(__dirname, 'static', 'config.default.json'),
  to: path.resolve(__dirname, 'dist', 'static', 'config.default.json')
})
module.exports = {
  plugins: [
    new WebpackCopyPlugin(apps),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    new VueLoaderPlugin()
  ],
  entry: {
    core: [
      'core-js/modules/es6.promise',
      'core-js/modules/es6.array.iterator',
      './src/phoenix.js',
    ]
  },
  output: {
    filename: 'core/[name].bundle.js',
    chunkFilename: 'core/[name].[id].bundle.js'
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: [/node_modules/, /apps/],
      include: [/src/],
      use: [{
        loader: 'babel-loader'
      }]
    }, {
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      include: [/node_modules\/material-design-icons-iconfont\/dist/, /static\/fonts\/ocft\/font/],
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          publicPath: '../fonts',
          outputPath: 'fonts'
        }
      }]
    }, {
      enforce: 'pre',
      test: /\.(js|vue)$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      exclude: [/node_modules/]
    }]
  }
}
