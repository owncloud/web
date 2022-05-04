import vue from 'rollup-plugin-vue'
import resolve from 'rollup-plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import modify from 'rollup-plugin-modify'
import { terser } from 'rollup-plugin-terser'
import visualizer from 'rollup-plugin-visualizer'
import * as path from 'path'
import del from 'rollup-plugin-delete'
import * as fs from 'fs'
import gzip from 'rollup-plugin-gzip'
import ejs from 'ejs'
import progress from 'rollup-plugin-progress'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import html from '@rollup/plugin-html'
import ts from 'rollup-plugin-ts'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import alias from '@rollup/plugin-alias'
import inject from '@rollup/plugin-inject'
import copy from '@rollup-extras/plugin-copy'

const production = !process.env.ROLLUP_WATCH
const sourcemap = process.env.SOURCE_MAP === 'true'
const { version } = require('./package.json')
const compilationTimestamp = new Date().getTime()

const config = {
  requirejs: {},
  cdn: process.env.CDN === 'true'
}
if (process.env.REQUIRE_TIMEOUT) {
  config.requirejs.waitSeconds = parseInt(process.env.REQUIRE_TIMEOUT)
}

const plugins = [
  postcss({
    extract: path.join('css', 'web.css'),
    minimize: production,
    sourceMap: sourcemap,
    config: false
  }),
  alias({
    entries: [
      { find: 'crypto', replacement: 'polyfills/crypto.js' },
      { find: 'qs', replacement: 'node_modules/qs/lib/index.js' }
    ]
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  vue({
    css: false
  }),
  nodePolyfills(),
  resolve({
    include: 'node_modules/**',
    dedupe: ['@vue/composition-api'],
    browser: true,
    preferBuiltins: false
  }),
  babel({
    exclude: 'node_modules/**'
  }),
  modify({
    'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
    'process.env.PACKAGE_VERSION': JSON.stringify(version),
    // todo: owncloud-sdk _makeOCSrequest has no catch
    // this is required if a network error for example 'blocked by CORS' happened
    'l(o.instance+p,{method:e,body:d.body,headers:h})':
      'l(o.instance+p,{method:e,body:d.body,headers:h}).catch(function(e){return r(e)})'
  }),
  ts({
    browserslist: false
  }),
  inject({
    Buffer: ['buffer', 'Buffer']
  }),
  json(),
  copy({
    targets: [
      { src: 'node_modules/requirejs/require.js', dest: 'js' },
      {
        src: 'node_modules/owncloud-design-system/dist/system/icons/*',
        dest: 'icons'
      }
    ],
    watch: false
  }),
  copy({
    targets: [
      { src: './packages/web-container/img/*', dest: 'img' },
      { src: './packages/web-container/*.{html,json,txt}' },
      { src: './packages/web-runtime/themes/**/*', dest: 'themes' },
      { src: `./config/${production ? 'config.json.dist' : 'config.json'}` }
    ]
  }),
  html({
    title: process.env.TITLE || 'ownCloud',
    attributes: {
      html: { lang: 'en' },
      link: [],
      script: []
    },
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'initial-scale=1.0, minimum-scale=1.0'
      },
      {
        name: 'theme-color',
        content: '#375f7E'
      },
      {
        'http-equiv': 'x-ua-compatible',
        content: 'IE=edge'
      }
    ],
    template: ({ attributes, files, meta, publicPath, title }) => {
      return new Promise((resolve, reject) => {
        ejs.renderFile(
          './packages/web-container/index.html.ejs',
          {
            helpers: {
              makeHtmlAttributes: html.makeHtmlAttributes
            },
            data: {
              attributes,
              meta,
              publicPath,
              title,
              files,
              bundle: Object.keys(files).reduce((acc, c) => {
                if (!Object.hasOwnProperty.call(acc, c)) {
                  acc[c] = {}
                }
                files[c].forEach((f) => {
                  const fp = path.parse(f.fileName)
                  const lastDash = fp.name.lastIndexOf('-')
                  acc[c][
                    production
                      ? fp.name.slice(0, lastDash !== -1 ? lastDash : 0) || fp.name
                      : fp.name
                  ] = c === 'js' ? fp.name : f.fileName
                })

                return acc
              }, {}),
              roots: {
                css: 'css',
                js: 'js'
              },
              config: config,
              compilationTimestamp: compilationTimestamp
            }
          },
          {},
          (err, html) => {
            if (err) {
              reject(err)
            } else {
              resolve(html)
            }
          }
        )
      })
    }
  }),
  progress()
]

if (production) {
  plugins.push(terser())
  plugins.push(
    del({
      runOnce: true,
      targets: path.join('dist', '*'),
      dot: true
    })
  )
}

if (process.env.SERVER === 'true') {
  plugins.push(
    serve({
      host: '0.0.0.0',
      contentBase: ['dist'],
      port: process.env.PORT || 9100
    })
  )
  plugins.push(
    livereload({
      watch: 'dist'
    })
  )
}

if (process.env.REPORT === 'true') {
  plugins.push(
    visualizer({
      filename: path.join('dist', 'report.html')
    })
  )
}

if (production) {
  plugins.push(gzip())
}

export default {
  input: fs.readdirSync('packages').reduce((acc, i) => {
    for (const extension of ['js', 'ts']) {
      const root = path.join('packages', i, 'src', `index.${extension}`)
      if (fs.existsSync(root)) {
        acc[i] = root
        break
      }
    }
    return acc
  }, {}),
  output: {
    dir: 'dist',
    format: 'amd',
    sourcemap: sourcemap,
    chunkFileNames: path.join('js', 'chunks', production ? '[name]-[hash].js' : '[name].js'),
    entryFileNames: path.join('js', production ? '[name]-[hash].js' : '[name].js')
  },
  manualChunks: (id) => {
    if (id.includes('node_modules')) {
      return 'vendor'
    }
  },
  onwarn: (warning) => {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.error(`(!) ${warning.message}`)
    }
  },
  preserveSymlinks: true,
  plugins
}
