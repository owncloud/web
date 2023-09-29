import { resolve } from 'path'
import { defineConfig } from 'vite'
import * as packageJson from './package.json'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  resolve: {
    alias: {
      path: 'rollup-plugin-node-polyfills/polyfills/path'
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
      name: packageJson.name,
      fileName: packageJson.name
    }
  },
  plugins: [
    vue(),
    dts({
      declarationOnly: true
    }),
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
