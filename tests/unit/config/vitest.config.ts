import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { compilerOptions } from '../../../vite.config.common'

const root = path.resolve(__dirname, '../../../')

export default defineConfig({
  plugins: [
    vue({ template: { compilerOptions } }),
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
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  test: {
    root,
    globals: true,
    environment: 'happy-dom',
    clearMocks: true,
    include: ['**/*.spec.ts'],
    setupFiles: ['tests/unit/config/vitest.init.ts', '@vitest/web-worker'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '.pnpm-store/*',
      'e2e/**'
    ],
    alias: {
      'vue-inline-svg': `${root}/tests/unit/stubs/empty.ts`,
      'js-generate-password': `${root}/tests/unit/stubs/empty.ts`,
      webfontloader: `${root}/tests/unit/stubs/webfontloader.ts`
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: `${root}/coverage`,
      reporter: 'lcov'
    }
  }
})
