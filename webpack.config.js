module.exports = {
	devtool: 'source-map',
	entry: './src/default.js',
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
	output : {
		path: `${__dirname}/core/js`,
		filename : 'core.bundle.js'
	},
	module: {
		rules: [{
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
					'vue-html-loader',
					'css-loader',
					'css-loader',
					'less-loader'
				]
			}
		}]
	}
}
