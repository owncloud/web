const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  plugins: [
    new VueLoaderPlugin()
  ],
  entry: {
    'compat-settings': [
      'core-js/modules/es6.promise',
      'core-js/modules/es6.array.iterator',
      './src/app.js'
    ]
  },
  output: {
    publicPath: 'apps/compat-settings/',
    chunkFilename: '[name].compat-settings.chunk.js',
    filename: 'compat-settings.bundle.js'
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        rootMode: 'upward'
      }
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    },
    {
      test: /\.jsx?$/,
      include: /node_modules\/(?=(query-string|split-on-first|strict-uri-encode)\/).*/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  ie: '11'
                }
              }
            ]
          ]
        }
      }
    },
    {
      test: /\.css$/,
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }]
  }
}
