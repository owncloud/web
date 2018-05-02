module.exports = {
    devtool: 'source-map',
	entry: './src/app.js',
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js'
		}
	},
	output : {
		path: `${__dirname}/js`,
		filename : "alert.bundle.js"
	},
	module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/,
		}]
	}
}
