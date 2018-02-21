module.exports = {
	entry: './src/default.js',
	output : {
		filename : './js/files.bundle.js'
	},
	module: {
		loaders: [{
			test: require.resolve('uikit'),
			loader: 'expose-loader?UIkit'
		}, {
			test: /\.js?$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
		}, {
			test: /\.scss?$/,
			loader: 'style-loader!css-loader!sass-loader'
		}, {
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
				loaders: {
					scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
					less: 'vue-style-loader!css-loader!less-loader' // <style lang="less">
				}
			}
		}]
	}
}
