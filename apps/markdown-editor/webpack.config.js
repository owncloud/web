const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin()
	],
  entry: {
    'markdown-editor': ['./src/app.js']
  },
  output: {
    publicPath: 'apps/markdown-editor/',
    chunkFilename: '[name].[hash].chunk.js',
    filename: "[name].bundle.js",
  },
	module: {
		rules: [{
			test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
		}, {
			test: /\.vue$/,
      exclude: [/node_modules/],
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
