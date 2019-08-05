const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const WebpackCopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackVersionFilePlugin = require('webpack-version-file-plugin')
const execa = require('execa')

const gitHash = execa.sync('git', ['rev-parse', '--short', 'HEAD']).stdout
const gitNumCommits = Number(execa.sync('git', ['rev-list', 'HEAD', '--count']).stdout)
const gitDirty = execa.sync('git', ['status', '-s', '-uall']).stdout.length > 0

const appFolder = path.resolve(__dirname, 'apps')
const apps = []
let config

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

const sourceFiles = [{
  from: path.resolve(__dirname, 'themes/**'),
  to: path.resolve(__dirname, 'dist')
}, {
  from: path.resolve(__dirname, 'node_modules', 'requirejs', 'require.js'),
  to: path.resolve(__dirname, 'dist', 'node_modules', 'requirejs')
}]
for (const file of sourceFiles) {
  apps.push(file)
}
module.exports = {
  plugins: [
    new WebpackVersionFilePlugin({
      packageFile: path.join(__dirname, 'package.json'),
      template: path.join(__dirname, 'src/version.ejs'),
      outputFile: path.join('build', 'version.json'),
      extras: {
        githash: gitHash,
        gitNumCommits: gitNumCommits,
        timestamp: Date.now(),
        dirty: gitDirty
      }
    }), new WebpackCopyPlugin(apps),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].[id].css'
    })
  ],
  entry: {
    core: [
      'whatwg-fetch',
      './src/phoenix.js'
    ]
  },
  output: {
    filename: 'core/[name].bundle.js',
    chunkFilename: 'core/[name].[id].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: [
          /src/
        ]
      },
      {
        test: /\.jsx?$/,
        include: /node_modules\/(?=(vuex-persist)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    ie: '11'
                  }
                }
              ]
            ]
          }
        }
      },
      {
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
      }, {
        test: /\.(sa|sc|c)ss$/,
        include: [/node_modules/, /src/, /static/],
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }]
  }
}
