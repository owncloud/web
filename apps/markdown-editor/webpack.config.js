const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  plugins: [
    new VueLoaderPlugin()
  ],
  devtool: 'source-map',
  entry: {
    'markdown-editor': [
      'core-js/modules/es6.promise',
      'core-js/modules/es6.array.iterator',
      './src/app.js'
    ]
  },
  output: {
    publicPath: 'apps/markdown-editor/',
    chunkFilename: '[name].markdown-editor.chunk.js',
    filename: 'markdown-editor.bundle.js'
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
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
}
