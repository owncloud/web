import { resolve } from 'path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json' assert { type: 'json' }

const projectRootDir = searchForWorkspaceRoot(process.cwd())

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${projectRootDir}/packages/design-system/src/styles/styles";`,
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  build: {
    lib: {
      entry: {
        'design-system': resolve(__dirname, 'src/index.ts'),
        'design-system/components': resolve(__dirname, 'src/components/index.ts'),
        'design-system/composables': resolve(__dirname, 'src/composables/index.ts'),
        'design-system/helpers': resolve(__dirname, 'src/helpers/index.ts')
      }
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies),
        '**/tests',
        '**/*.spec.ts'
      ]
    }
  },
  plugins: [
    vue(),
    dts({ exclude: ['**/tests', '**/*.spec.ts'] }),
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
