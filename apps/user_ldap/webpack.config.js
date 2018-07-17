module.exports = {
    devtool: 'source-map',
	entry: './src/app.js',
	output : {
		path: `${__dirname}/js`,
		chunkFilename: '[name].user_ldap.chunk.js',
		filename : "user_ldap.bundle.js",
		publicPath: 'apps/user_ldap/js/'
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
