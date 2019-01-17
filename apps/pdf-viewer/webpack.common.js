const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  plugins: [
    new VueLoaderPlugin(),
  ],
  entry: './src/app.js',
  output : {
    publicPath: 'apps/pdf-viewer/',
    chunkFilename: '[name].pdf-viewer.chunk.js',
    filename : "pdf-viewer.bundle.js",
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      enforce: 'pre',
      test: /\.(js|vue)$/,
      exclude: /node_modules/,
      loader: "eslint-loader"
    }, {
      test: /\.css$/,
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }]
  }
}
