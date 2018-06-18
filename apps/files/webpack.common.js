module.exports = {
	entry: './src/default.js',
	output : {
		path: `${__dirname}/js`,
		chunkFilename: '[name].files.chunk.js',
		filename : "files.bundle.js",
		publicPath: 'apps/files/js/'
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
