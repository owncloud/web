import path from 'path'
import serve from 'rollup-plugin-serve'
import vue from 'rollup-plugin-vue'

const dev = process.env.SERVER === 'true'

export default {
  input: path.resolve(__dirname, 'src/app.js'),
  output: {
    format: 'amd',
    file: 'dist/app.js'
  },
  external: ['vue'],
  plugins: [
    vue(),
    dev &&
      serve({
        port: 3000,
        contentBase: ['dist']
      })
  ]
}
