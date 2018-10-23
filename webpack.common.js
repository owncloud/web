const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
    new VueLoaderPlugin()
  ],
	entry: './src/default.js',
	output: {
		path: `${__dirname}/core/js`,
		filename: 'core.bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: [/node_modules/, /apps/],
				include: [/src/]
			}, {
				test: /\.vue$/,
				loader: 'vue-loader',
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
