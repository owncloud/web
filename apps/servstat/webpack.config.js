const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  plugins: [
    new VueLoaderPlugin()
  ],
  devtool: 'source-map',
	entry: {
    servstat: ['./src/app.js']
  },
	output : {
		chunkFilename: '[name].servstat.chunk.js',
		filename : "servstat.bundle.js",
	},
  module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/
		},{
      test: /\.vue$/,
      loader: 'vue-loader',
      exclude: [/node_modules/]
    }]
	}
}
