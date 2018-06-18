const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	devtool: 'none',
	resolve: {
		alias: {
			vue: 'vue/dist/vue.min.js'
		}
	}
});
