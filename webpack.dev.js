const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	devtool: 'source-map',
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js'
		}
	}
});
