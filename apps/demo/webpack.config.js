module.exports = {
	devtool: 'source-map',
	entry: {
		demo: [
			'./src/app.js',
		]
	},
	output: {
		chunkFilename: '[name].[id].chunk.js',
		filename: "[name].bundle.js",
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
