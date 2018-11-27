const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const WebpackCopyPlugin = require('webpack-copy-plugin')

var copy_config = [
	{
		from: './static/fonts/oc/font/*',
		to: './core/fonts'
	}
]

module.exports = {
	plugins: [
		new WebpackCopyPlugin(copy_config),
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: "css/[name].css",
				chunkFilename: "css/[name].[id].css"
		})
	],
	entry: {
		core: [
			'./src/default.js',
			'./node_modules/material-design-icons-iconfont/dist/material-design-icons.css',
			'./node_modules/vuetify/dist/vuetify.css',
			'./static/fonts/ocft/css/ocft.css']
	},
	output: {
		path: path.resolve(__dirname, 'core'),
		filename: 'js/[name].bundle.js',
		chunkFilename: 'js/[name].[id].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: [/node_modules/, /apps/],
				include: [/src/]
			}, {
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				include: [/node_modules\/material-design-icons-iconfont\/dist/, /static\/fonts\/ocft\/font/],
				use: [{
						loader: 'file-loader',
						options: {
								name: '[name].[ext]',
								publicPath: '../fonts',
								outputPath: 'fonts'
						}
				}]
			},{
				test: /\.vue$/,
				loader: 'vue-loader',
				exclude: [/node_modules/]
			}, {
				test: /\.(sa|sc|c)ss$/,
				include: [/node_modules/,/src/, /static/],
				use: [
					"style-loader",
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader"
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
