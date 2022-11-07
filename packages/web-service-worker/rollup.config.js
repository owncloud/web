import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import modify from 'rollup-plugin-modify'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript';

const production = false
const { version } = "1.0.0"

export default {
  input: 'src/main.ts',
  output: {
    file: 'build/sw-bundle.js',
    format: 'cjs'
  },
  plugins: [
    typescript({ compilerOptions: {lib: ["es5", "es6", "dom"], target: "es5"}}),
    resolve({
      include: 'node_modules/**',
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    modify({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      'process.env.PACKAGE_VERSION': JSON.stringify(version),
      // todo: owncloud-sdk _makeOCSrequest has no catch
      // this is required if a network error for example 'blocked by CORS' happened
      'l(o.instance+p,{method:e,body:d.body,headers:h})':
        'l(o.instance+p,{method:e,body:d.body,headers:h}).catch(function(e){return r(e)})'
    }),
    nodePolyfills(),
    babel({
      // babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
  ]
};