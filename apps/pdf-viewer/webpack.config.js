const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin()
	],
	devtool: 'source-map',
	entry: './src/app.js',
	output: {
		path: `${__dirname}/js`,
		chunkFilename: '[name].pdf-viewer.chunk.js',
		filename: "pdf-viewer.bundle.js",
		publicPath: 'apps/pdf-viewer/js/'
	},
	module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/
    }, {
      test: /\.css$/,
      loader: 'css-loader'
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
		}
		]
	}
}
