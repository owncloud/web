import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import modify from 'rollup-plugin-modify'
import terser from '@rollup/plugin-terser'
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
import html, { makeHtmlAttributes } from '@rollup/plugin-html'
import typescript from 'rollup-plugin-ts'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import alias from '@rollup/plugin-alias'
import inject from '@rollup/plugin-inject'
import copy from '@rollup-extras/plugin-copy'
import packageJson from './package.json' assert { type: "json" }
import {fileURLToPath} from 'url'
import { dirname, resolve as pathResolve } from 'path'

const production = false
const { version } = '1.0.0'

const __filename = fileURLToPath(import.meta.url)
const projectRootDir = dirname(__filename)

export default {
  input: 'src/main.ts',
  output: {
    file: 'build/sw-bundle.js',
    format: 'cjs'
  },
  plugins: [
    typescript({ compilerOptions: { lib: ['es5', 'es6', 'dom'], target: 'es5' } }),
    alias({
      entries: [
        { find: 'crypto', replacement: pathResolve(projectRootDir, 'polyfills/crypto.js') },
        { find: 'qs', replacement: pathResolve(projectRootDir, 'node_modules/qs/lib/index.js') }
      ]
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    nodePolyfills(),
    inject({
      Buffer: ['buffer', 'Buffer'],
      XMLHttpRequest: 'xhr-shim'
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    modify({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      'process.env.PACKAGE_VERSION': JSON.stringify(version),
      // todo: owncloud-sdk _makeOCSrequest has no catch
      // this is required if a network error for example 'blocked by CORS' happened
      'l(o.instance+p,{method:e,body:d.body,headers:h})':
        'l(o.instance+p,{method:e,body:d.body,headers:h}).catch(function(e){return r(e)})'
    }),
    babel({
      // babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
}
