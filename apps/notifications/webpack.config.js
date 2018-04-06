module.exports = {
    devtool: 'source-map',
	entry: './src/default.js',
	output : {
		path: `${__dirname}/js`,
		filename : 'notifications.bundle.js'
	},
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js'
		}
	},
	module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/,
			use: 'babel-loader',
		}, {
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
				use: [
 					'vue-style-loader',
					'css-loader',
					'css-loader',
					'less-loader'
				]
			}
		}]
	}
}
