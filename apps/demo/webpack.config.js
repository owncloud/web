module.exports = {
	devtool: 'source-map',
	entry: {
    demo: ['./src/app.js']
  },
	output: {
		chunkFilename: '[name].demo.chunk.js',
		filename: "demo.bundle.js",
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
