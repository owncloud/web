const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	plugins: [
		new VueLoaderPlugin()
	],
	entry: {
    files: ['./src/default.js']
  },
	output : {
		chunkFilename: '[name].files.chunk.js',
		filename : "files.bundle.js",
	},
	module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/,
		},{
      test: /\.vue$/,
      loader: 'vue-loader',
      exclude: [/node_modules/]
    }]
	}
}
