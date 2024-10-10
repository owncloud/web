import { join, resolve } from 'path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json' assert { type: 'json' }

const projectRootDir = searchForWorkspaceRoot(process.cwd())
const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]

export default defineConfig({
  resolve: {
    alias: {
      crypto: join(projectRootDir, 'polyfills/crypto.js')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "design-system/src/styles/styles";`,
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'web-pkg',
      fileName: 'web-pkg'
    },
    rollupOptions: {
      external: external.filter(
        (e) =>
          // we need to include the ODS in the bundle because we don't publish it on npm
          e !== 'design-system' &&
          // something is off with this lib, see https://github.com/ahmadjoya/generate-password-lite/issues/8
          e !== 'js-generate-password'
      )
    }
  },
  plugins: [
    vue(),
    nodePolyfills({
      exclude: ['crypto']
    }),
    dts({ exclude: ['**/tests'] }),
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
