const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
	plugins: [
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, 'README.md'),
				to: path.resolve(__dirname, 'dist')
			},{
				from: path.resolve(__dirname, 'CHANGELOG.md'),
				to: path.resolve(__dirname, 'dist')
			},{
				from: path.resolve(__dirname, 'LICENSE'),
				to: path.resolve(__dirname, 'dist')
			}
		])
	],
	mode: 'production',
	devtool: 'none',
	resolve: {
		alias: {
			vue: 'vue/dist/vue.min.js'
		}
	}
});
