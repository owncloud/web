const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin()
	],
	devtool: 'source-map',
	entry: './src/app.js',
	output: {
		path: `${__dirname}/js`,
		chunkFilename: '[name].markdown-editor.chunk.js',
		filename: "markdown-editor.bundle.js",
		publicPath: 'apps/markdown-editor/js/'
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
