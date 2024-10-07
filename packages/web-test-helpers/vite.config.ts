import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import pkg from './package.json' assert { type: 'json' }
import vue from '@vitejs/plugin-vue'

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@ownclouders/design-system/src/styles/styles";`,
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  resolve: {
    alias: {
      // stub ODS stuff for tests. only needed because we need to include the ODS in the bundle
      'vue-inline-svg': resolve(__dirname, './../../tests/unit/stubs/empty.ts'),
      'js-generate-password': resolve(__dirname, './../../tests/unit/stubs/empty.ts'),
      webfontloader: resolve(__dirname, './../../tests/unit/stubs/webfontloader.ts')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'web-test-helpers',
      fileName: (format) => `web-test-helpers.${format}.js`
    },
    rollupOptions: {
      // we need to include the ODS in the bundle because we don't publish it on npm
      external: external.filter((e) => e !== '@ownclouders/design-system')
    }
  },
  plugins: [
    vue(),
    nodePolyfills({
      exclude: ['crypto']
    }),
    dts(),
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
