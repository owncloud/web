const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')

// Polyfill for virtual scroller
require('intersection-observer')

module.exports = {
  plugins: [new VueLoaderPlugin()],
  entry: {
    files: './src/default.js'
  },
  output: {
    publicPath: 'apps/files/',
    chunkFilename: '[name].files.chunk.js',
    filename: 'files.bundle.js',
    library: 'files'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.resolve('src')],
        options: {
          rootMode: 'upward'
        }
      },
      {
        test: /\.jsx?$/,
        include: [/node_modules\/vue2-dropzone\/.*/, /node_modules\/p-.+/],
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
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: [/node_modules/],
        options: {
          loaders: {
            scss: 'vue-style-loader!css-loader!sass-loader'
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        include: [/node_modules/, /src/, /static/],
        use: ['vue-style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
}
