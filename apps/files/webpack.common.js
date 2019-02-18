const integratePhoenix = require('../../webpack-phoenix-integration')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = integratePhoenix({
  plugins: [
    new VueLoaderPlugin(),
  ],
  entry: {
    files: [
      'core-js/modules/es6.promise',
      'core-js/modules/es6.array.iterator',
      './src/default.js'
    ]
  },
  output: {
    publicPath: 'apps/files/',
    chunkFilename: '[name].files.chunk.js',
    filename: 'files.bundle.js',
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      enforce: 'pre',
      test: /\.(js|vue)$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      exclude: [/node_modules/]
    }, {
      test: /\.css$/,
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }]
  }
})
