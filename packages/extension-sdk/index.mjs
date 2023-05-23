// ATTENTION: this is a .mjs (instead of a .ts) file on purpose,
// because we don't want to transpile it before publishing
// c.f. https://github.com/vitejs/vite/issues/5370

import { mergeConfig, searchForWorkspaceRoot } from 'vite'
import { join } from 'path'
import { cwd } from 'process'
import { readFileSync } from 'fs'

import vue from '@vitejs/plugin-vue'
import serve from 'rollup-plugin-serve'

const distDir = 'dist'

const certsDir = process.env.OWNCLOUD_CERTS_DIR
const defaultHttps = () =>
  certsDir && {
    key: readFileSync(join(certsDir, 'server.key')),
    cert: readFileSync(join(certsDir, 'server.crt'))
  }

export const defineConfig = (overrides = {}) => {
  return ({ mode }) => {
    const isProduction = mode === 'production'
    const isServing = !isProduction

    // read package name from vite workspace
    const packageJson = JSON.parse(
      readFileSync(join(searchForWorkspaceRoot(cwd()), 'package.json')).toString()
    )

    const name = packageJson.name

    // take vite standard config and reuse it for rollup-plugin-serve config
    const { https = defaultHttps(), port = 9210, host = 'localhost' } = overrides?.server || {}
    const isHttps = !!https

    if (isServing) {
      console.log(
        `>>> Serving extension at http${isHttps ? 's' : ''}://${host}:${port}/js/${name}.js`
      )
    }

    return mergeConfig(
      {
        server: {
          host,
          port,
          strictPort: true,
          ...(isHttps && https)
        },
        build: {
          cssCodeSplit: true,
          minify: isProduction,
          rollupOptions: {
            // keep in sync with packages/web-runtime/src/container/application/index.ts
            external: [
              'vue',
              'vuex',
              'luxon',
              'vue3-gettext',

              '@ownclouders/web-client',
              '@ownclouders/web-pkg',
              'web-client',
              'web-pkg'
            ],
            preserveEntrySignatures: 'strict',
            input: {
              [name]: './src/index.ts'
            },
            output: {
              format: 'amd',
              dir: distDir,
              chunkFileNames: join('js', 'chunks', '[name]-[hash].mjs'),
              entryFileNames: join('js', `[name]${isProduction ? '-[hash]' : ''}.js`)
            },
            plugins: [
              isServing &&
                serve({
                  headers: {
                    'access-control-allow-origin': '*'
                  },
                  contentBase: distDir,
                  ...(https && { https }),
                  ...(port && { port })
                })
            ]
          }
        },
        plugins: [
          vue({
            // set to true when switching to esm
            customElement: false
          })
        ]
      },
      overrides
    )
  }
}
