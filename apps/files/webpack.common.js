const integratePhoenix = require('../../webpack-phoenix-integration')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path');

module.exports = integratePhoenix({
  plugins: [
    new VueLoaderPlugin(),
  ],
  entry: {
    files: './src/default.js'
  },
  output: {
    publicPath: 'apps/files/',
    chunkFilename: '[name].files.chunk.js',
    filename: 'files.bundle.js',
    library: 'files'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [
          path.resolve('src'),
          path.resolve('node_modules/vue2-dropzone/dist/')
        ],
        options: {
          rootMode: "upward",
        }
      },
      {
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
