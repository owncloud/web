import { join, resolve } from 'path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import dts from 'vite-plugin-dts'

const projectRootDir = searchForWorkspaceRoot(process.cwd())

export default defineConfig({
  resolve: {
    alias: {
      path: 'rollup-plugin-node-polyfills/polyfills/path',
      crypto: join(projectRootDir, 'polyfills/crypto.js'),
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      string_decoder: 'rollup-plugin-node-polyfills/polyfills/string-decoder',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
      events: 'rollup-plugin-node-polyfills/polyfills/events'
    }
  },
  build: {
    lib: {
      entry: {
        'web-client': resolve(__dirname, 'src/index.ts'),
        'web-client/graph': resolve(__dirname, 'src/graph/index.ts'),
        'web-client/graph/generated': resolve(__dirname, 'src/graph/generated/index.ts'),
        'web-client/ocs': resolve(__dirname, 'src/ocs/index.ts'),
        'web-client/sse': resolve(__dirname, 'src/sse/index.ts'),
        'web-client/webdav': resolve(__dirname, 'src/webdav/index.ts')
      }
    }
  },
  plugins: [dts()]
})
