const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin()
	],
	devtool: 'source-map',
	entry: {
		'markdown-editor': [
			'./src/app.js',
		]
	},
	output: {
		chunkFilename: '[name].[id].chunk.js',
		filename: "[name].bundle.js",
		publicPath: 'apps/markdown-editor/js/'
	},
	module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/
		}, {
			test: /\.vue$/,
			loader: 'vue-loader'
		}]
	}
}
