module.exports = {
    devtool: 'source-map',
	entry: './src/app.js',
	output : {
		path: `${__dirname}/js`,
		chunkFilename: '[name].servstat.chunk.js',
		filename : "servstat.bundle.js",
		publicPath: 'apps/servstat/js/'
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
