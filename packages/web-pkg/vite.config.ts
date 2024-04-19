import { join, resolve } from 'path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vue from '@vitejs/plugin-vue'

const projectRootDir = searchForWorkspaceRoot(process.cwd())

export default defineConfig({
  resolve: {
    alias: {
      crypto: join(projectRootDir, 'polyfills/crypto.js')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "design-system/src/styles/styles";`
      }
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'web-pkg',
      fileName: 'web-pkg'
    }
  },
  plugins: [
    vue(),
    nodePolyfills({
      exclude: ['crypto']
    }),
    dts({ declarationOnly: true, exclude: ['**/tests'] }),
    {
      name: '@ownclouders/vite-plugin-docs',
      transform(src, id) {
        if (id.includes('type=docs')) {
          return {
            code: 'export default {}',
            map: null
          }
        }
      }
    }
  ]
})
