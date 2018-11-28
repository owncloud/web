const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin()
	],
	entry: {
		files: [
			'./src/default.js',
		]
	},
	output : {
		chunkFilename: '[name].[id].chunk.js',
		filename: "[name].bundle.js",
	},
	module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/,
		}, {
			test: /\.vue$/,
			loader: 'vue-loader'
		}]
	}
}
