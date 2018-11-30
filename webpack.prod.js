const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const WebpackCopyPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
  plugins: [
    WebpackCopyPlugin([{
                        from: 'README.md',
                        to: './dist/'
                      },{
                        from: 'sw.js',
                        to: './dist/'
                      },{
                        from: 'LICENSE',
                        to: './dist/'
                      },{
                        from: 'CHANGELOG.md',
                        to: './dist/'
                      },{
                        from: 'manifest.json',
                        to: './dist/'
                      }])
  ],
	mode: 'production',
	devtool: 'none',
	resolve: {
		alias: {
			vue: 'vue/dist/vue.min.js'
		}
	}
});
