const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const appFolder = path.resolve(__dirname, 'apps')
let apps = []

fs.readdirSync(appFolder)
		.forEach(function (mod) {
							if(fs.existsSync(path.resolve(appFolder, mod))){
								var modPath = {
									from: path.resolve(appFolder, mod, 'dist' ),
									to: './apps/' + mod
								}
								apps.push(modPath)
							}
						})

const src_files = [{
										from: path.resolve(__dirname, 'favicon.ico'),
										to: path.resolve(__dirname, 'dist')
									},{
						        from: path.resolve(__dirname, 'static/**'),
						        to: path.resolve(__dirname, 'dist')
						      },{
						        from: path.resolve(__dirname, 'sw.js'),
						        to: path.resolve(__dirname, 'dist')
						      },{
						        from: path.resolve(__dirname, 'themes/*'),
						        to: path.resolve(__dirname, 'dist')
						      },{
						        from: path.resolve(__dirname, 'node_modules', 'requirejs', 'require.js'),
						        to: path.resolve(__dirname, 'dist', 'node_modules', 'requirejs')
						      }]
for(file of src_files){
	apps.push(file)
}
module.exports = {
	plugins: [
		new MiniCssExtractPlugin({
						filename: './css/[name].css',
						chunkFilename: './css/[name].[id].css'}),
		new HtmlWebpackPlugin({
			template: 'index.html'
		}),
		new VueLoaderPlugin(),
		new CopyWebpackPlugin(apps)
	],
	output: {
		filename: './core/[name].bundle.js',
		chunkFilename: './core/[name].[id].bundle.js',
	},
	entry: {
		core: [
			'./node_modules/material-design-icons-iconfont/dist/material-design-icons.css',
			'./node_modules/vuetify/dist/vuetify.css',
			'./src/default.js'
		]
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: [/node_modules/, /apps/],
				include: [/src/]
			}, {
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				include: [/node_modules\/material-design-icons-iconfont\/dist/],
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
				include: [/node_modules/,/src/],
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
