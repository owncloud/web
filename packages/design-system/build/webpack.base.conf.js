'use strict'
const path = require('path')
const config = require('../config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? config.build.mode : config.dev.mode,
  context: path.resolve(__dirname, '../'),
  resolve: {
    extensions: ['.js', '.vue', '.json', '.ts'],
    alias: {
      vue$: 'vue/dist/vue.esm-bundler.js',
      '@': resolve('src')
    },
    fallback: {
      url: require.resolve('url/'),
      path: false,
      'process/browser': require.resolve('process/browser')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: [/\.vue$/]
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            cacheBusting: config.dev.cacheBusting,
            transformAssetUrls: {
              video: ['src', 'poster'],
              source: 'src',
              img: 'src',
              image: 'xlink:href'
            }
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('docs'), resolve('src'), resolve('test')]
      },
      {
        test: /\.jsx?$/,
        include:
          /node_modules\/(?=(acorn-jsx|regexpu-core|unicode-match-property-ecmascript|unicode-match-property-value-ecmascript|react-dev-utils|ansi-styles|ansi-regex|chalk|strip-ansi)\/).*/,
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
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:7][ext]'
        }
      },
      {
        test: /\.svg$/,
        type: 'asset/inline'
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'media/[name].[hash:7][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:7][ext]'
        }
      },
      {
        test: /\.(css|scss)$/,
        use: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [
                path.join(__dirname, '../src/assets/tokens/docs.scss'),
                path.join(__dirname, '../src/assets/tokens/ods.scss'),
                path.join(__dirname, '../docs/docs.mixins.scss'),
                path.join(__dirname, '../docs/docs.functions.scss'),
                path.join(__dirname, '../docs/docs.spacing.scss'),
                path.join(__dirname, '../src/styles/styles.scss')
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin({ filename: 'style.css' })]
}
