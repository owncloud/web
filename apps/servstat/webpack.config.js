module.exports = {
    devtool: 'source-map',
	entry: {
    servstat: ['./src/app.js']
  },
	output : {
		chunkFilename: '[name].servstat.chunk.js',
		filename : "servstat.bundle.js",
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
