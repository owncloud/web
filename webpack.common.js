const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: "css/uikit.[name].css",
				chunkFilename: "css/uikit.[id].css"
		})
	],
	entry: {
		core: './src/default.js',
		owncloud: './src/themes/owncloud.less'
	},
	output: {
		path: path.resolve(__dirname, 'core'),
		filename: 'js/[name].bundle.js',
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
			},
			{
        test: /\.(le|sa|sc|c)ss$/,
				include: [/src/],
				use: [
					// fallback to style-loader in development
					MiniCssExtractPlugin.loader,
					"css-loader",
					"less-loader"
				]
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
