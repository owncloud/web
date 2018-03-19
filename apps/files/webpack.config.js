module.exports = {
	entry: './src/default.js',
	output : {
		path: `${__dirname}/js`,
		filename : 'files.bundle.js'
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
