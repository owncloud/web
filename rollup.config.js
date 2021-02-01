import vue from 'rollup-plugin-vue'
import resolve from 'rollup-plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import builtins from '@erquhart/rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import copy from 'rollup-plugin-copy'
import modify from 'rollup-plugin-modify'
import { terser } from 'rollup-plugin-terser'
import visualizer from 'rollup-plugin-visualizer'
import html from '@rollup/plugin-html'
import * as path from 'path'
import del from 'rollup-plugin-delete'
import * as fs from 'fs'
import gzip from 'rollup-plugin-gzip'
import ejs from 'ejs'
import * as _ from 'lodash'
import { minify } from 'html-minifier'
import progress from 'rollup-plugin-progress'
import alias from '@rollup/plugin-alias'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'

const env = {
  production: !process.env.ROLLUP_WATCH,
  get development() {
    return !this.production
  },
  ocis: process.env.WITH_OC_10 !== 'true',
  get minify() {
    return {
      enabled:
          typeof process.env.WITH_MINIFY === 'undefined'
              ? this.production
              : process.env.WITH_MINIFY === 'true'
    }
  },
  get server() {
    return {
      enabled:
          typeof process.env.WITH_SERVER === 'undefined'
              ? this.development
              : process.env.WITH_SERVER === 'true'
    }
  },
  get gzip() {
    return {
      enabled:
        typeof process.env.WITH_GZIP === 'undefined'
          ? this.production
          : process.env.WITH_GZIP === 'true'
    }
  },
  get reports() {
    return {
      enabled: process.env.WITH_REPORTS === 'true'
    }
  },
  get sourcemap() {
    return {
      enabled: this.reports.enabled || process.env.WITH_SOURCEMAP === 'false'
    }
  }
}

const conf = {
  out: 'dist',
  roots: {
    css: 'css',
    js: 'js',
    reports: 'reports'
  },
  replace: {
    /* todo: remove after pending PR is merged */
    /* fix for 'assignment to undeclared variable dav' in davclient.js/lib/client.js 6:0 */
    "if (typeof dav === 'undefined') { dav = {}; }": 'var dav = dav || {}',
    /* todo: add something like crypto-browserify as a crypto replacement which is node only */
    /* crypto is not available, even if it's build with polyfill in src repo. */
    'n.pbkdf2Sync(e,r,s,i.HASH_LENGTH,t).toString(i.DIGEST_VALUE)': 1
  },
  copy: [
    { src: './packages/web-container/img' },
    { src: './packages/web-container/themes' },
    { src: './packages/web-container/oidc-callback.html' },
    { src: './packages/web-container/oidc-silent-redirect.html' },
    { src: './packages/web-container/manifest.json' }
  ],
  html: {
    title: 'ownCloud',
    meta: [
      {
        name: 'theme-color',
        content: '#375f7E'
      }
    ]
  },
  alias: {
    entries: {}
  },
  ocis: env.ocis,
  minify: env.minify,
  server: env.server,
  gzip: env.gzip,
  reports: env.reports,
  sourcemap: env.sourcemap
}

export default {
  input: fs.readdirSync('packages').reduce((acc, i) => {
    const p = path.join('packages', i, 'src', 'index.js')
    if (fs.existsSync(p)) {
      acc[i] = p
    }
    return acc
  }, {}),
  output: {
    dir: conf.out,
    format: 'amd',
    sourcemap: conf.sourcemap.enabled,
    chunkFileNames: path.join(
      conf.roots.js,
      '_chunks',
      env.production ? '[name]-[hash].js' : '[name].js'
    ),
    entryFileNames: path.join(conf.roots.js, env.production ? '[name]-[hash].js' : '[name].js')
  },
  manualChunks: id => {
    if (id.includes('node_modules')) {
      return 'vendor'
    }
  },
  onwarn: warning => {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.error(`(!) ${warning.message}`)
    }
  },
  plugins: [
    del({
      runOnce: true,
      targets: path.join(conf.out, '*'),
      dot: true
    }),
    alias({
      ...conf.alias
    }),
    postcss({
      extract: path.join(conf.roots.css, 'web.css'),
      minimize: env.production,
      sourceMap: conf.sourcemap.enabled,
      exec: true
    }),
    vue({
      css: false
    }),
    resolve({
      mainFields: ['browser', 'jsnext', 'module', 'main'],
      include: 'node_modules/**',
      browser: true,
      preferBuiltins: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    modify({
      'process.env.NODE_ENV': JSON.stringify('production'),
      ...conf.replace
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    globals(),
    builtins(),
    json(),
    copy({
      copyOnce: true,
      targets: [
        ...conf.copy.map(c => {
          return {
            src: c.src,
            dest: conf.out,
            ...(c.rename && { rename: c.rename })
          }
        }),
        ...(env.development
          ? [
              {
                src: `./config/config.json.sample-${conf.ocis ? 'ocis' : 'oc10'}`,
                dest: conf.out,
                rename: 'config.json'
              }
            ]
          : []),
        {
          src: ['node_modules/requirejs/require.js'],
          dest: path.join(conf.out, conf.roots.js)
        }
      ]
    }),
    html({
      title: conf.html.title,
      attributes: _.merge(
        {
          html: { lang: 'en' },
          link: [],
          script: []
        },
        conf.html.attributes
      ),
      meta: [
        {
          charset: 'utf-8'
        },
        {
          name: 'viewport',
          content: 'initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no'
        },
        {
          name: 'theme-color',
          content: '#375f7E'
        },
        {
          'http-equiv': 'x-ua-compatible',
          content: 'IE=11'
        },
        ...conf.html.meta
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
                  files[c].forEach(f => {
                    const fp = path.parse(f.fileName)
                    acc[c][
                      env.production
                        ? fp.name.substr(0, fp.name.lastIndexOf('-')) || fp.name
                        : fp.name
                    ] = c === 'js' ? fp.name : f.fileName
                  })

                  return acc
                }, {}),
                roots: conf.roots
              }
            },
            {},
            (err, html) => {
              if (err) {
                reject(err)
              } else {
                if (conf.minify.enabled) {
                  html = minify(html, {
                    removeComments: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeEmptyAttributes: true,
                    minifyJS: true,
                    minifyCSS: true
                  })
                }
                resolve(html)
              }
            }
          )
        })
      }
    }),
    progress(),
    env.minify.enabled && terser(),
    env.server.enabled && serve({
      contentBase: [conf.out],
      //port: 8300, // toDo -> ocis port
      port: 9100, // toDo -> ocis port
    }),
    conf.reports.enabled &&
      visualizer({
        sourcemap: conf.sourcemap.enabled,
        gzipSize: conf.gzip.enabled,
        filename: path.join(conf.out, conf.roots.reports, 'visualizer.html')
      }),
    conf.gzip.enabled && gzip()
  ]
}
