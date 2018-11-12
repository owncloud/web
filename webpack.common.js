const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: "css/[name].css",
				chunkFilename: "css/[id].css"
		})
	],
	entry: {
		core: [
			'./src/default.js',
			'./src/themes/owncloud.less',
			'./node_modules/material-design-icons-iconfont/dist/material-design-icons.css',
			'./node_modules/vuetify/dist/vuetify.css']
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
				exclude: [/node_modules/]
			}, {
				test: /\.(sa|sc|c)ss$/,
				exclude: [/src/],
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader"
				]
			},
			{
					test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
					include: [/node_modules\/material-design-icons-iconfont\/dist/],
					use: [{
							loader: 'file-loader',
							options: {
									name: '[name].[ext]',
									outputPath: '../fonts'
							}
					}]
			},
			{
        test: /\.(le|c)ss$/,
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
