module.exports = {
	devtool: 'source-map',
	entry: './src/default.js',
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js'
		}
	},
	output: {
		path: `${__dirname}/core/js`,
		filename: 'core.bundle.js',
		library: "OC",
		libraryTarget: "var",
		libraryExport: "default"
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: [/node_modules/, /apps/],
				include: [/src/],
				use: 'babel-loader'
			}, {
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					use: [
						'vue-style-loader',
						'css-loader',
						'less-loader'
					]
				}
			}
		]
	},
	// some weird bug when loading js-owncloud-client, no idea... see https://github.com/webpack-contrib/css-loader/issues/447
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	}
};
