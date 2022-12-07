import { defineConfig, PluginOption, UserConfigExport } from 'vite'
import { mergeConfig, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue2'
import EnvironmentPlugin from 'vite-plugin-environment'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { treatAsCommonjs } from 'vite-plugin-treat-umd-as-commonjs'
import visualizer from 'rollup-plugin-visualizer'

import ejs from 'ejs'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'

// build config
import packageJson from './package.json'
import { getUserAgentRegExp } from 'browserslist-useragent-regexp'

const buildConfig = {
  requirejs: {},
  cdn: process.env.CDN === 'true',
  documentation_url: process.env.DOCUMENTATION_URL,
  ...(process.env.REQUIRE_TIMEOUT && {
    requirejs: { waitSeconds: parseInt(process.env.REQUIRE_TIMEOUT) }
  })
}

const projectRootDir = searchForWorkspaceRoot(process.cwd())
const { version } = packageJson
const supportedBrowsersRegex = getUserAgentRegExp({ allowHigherVersions: true })

const stripScssMarker = '/* STYLES STRIP IMPORTS MARKER */'

// determine inputs
const input = readdirSync('packages').reduce(
  (acc, i) => {
    for (const extension of ['js', 'ts']) {
      const root = join('packages', i, 'src', `index.${extension}`)
      if (existsSync(root)) {
        acc[i] = root
        break
      }
    }
    return acc
  },
  { 'index.html': 'index.html' }
)

export default defineConfig(({ mode }) => {
  const production = mode === 'production'
  const ocis = process.env.OCIS !== 'false'
  let config: UserConfigExport
  let configName: string
  if (ocis) {
    configName = 'ocis'
    config = {
      ...(!production && {
        server: {
          port: 9201,
          https: {
            key: readFileSync('./dev/docker/ocis-ca/server.key'),
            cert: readFileSync('./dev/docker/ocis-ca/server.crt')
          },
          // workaround: https://github.com/owncloud/ocis/issues/5108
          proxy: Object.fromEntries(
            ['api', 'ocs', 'graph', 'remote.php', 'app', 'archiver', 'settings.js'].map((p) => [
              `/${p}`,
              {
                target: 'https://host.docker.internal:9200',
                secure: false
              }
            ])
          )
        }
      })
    }
  } else {
    configName = 'oc10'
    config = {
      server: {
        port: 8081
      }
    }
  }

  return mergeConfig(
    {
      base: '',
      publicDir: 'packages/web-container',
      build: {
        // TODO: Vue3: We currently cannot inline styles of components because @vite/plugin-vue2 does not support it
        // c.f. https://github.com/vitejs/vite-plugin-vue2/issues/18
        // That's why we need to put all styles of our monorepo apps into a monolithic css file for now
        // Once the above issue is resolved or we switch to @vitejs/plugin-vue, we can remove the `cssCodeSplit` setting here
        cssCodeSplit: false,
        rollupOptions: {
          preserveEntrySignatures: 'strict',
          input,
          output: {
            dir: 'dist',
            chunkFileNames: join('js', 'chunks', '[name]-[hash].mjs'),
            entryFileNames: join('js', '[name]-[hash].mjs'),
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                return 'vendor'
              }
            }
          }
        }
      },
      server: {
        host: 'host.docker.internal',
        strictPort: true
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `@import "${projectRootDir}/packages/design-system/src/styles/styles";${stripScssMarker}`
          }
        }
      },
      resolve: {
        alias: {
          crypto: join(projectRootDir, 'polyfills/crypto.js'),
          buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
          path: 'rollup-plugin-node-polyfills/polyfills/path',

          // owncloud-sdk // sax
          stream: 'rollup-plugin-node-polyfills/polyfills/stream',
          util: 'rollup-plugin-node-polyfills/polyfills/util',
          string_decoder: 'rollup-plugin-node-polyfills/polyfills/string-decoder',
          process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
          events: 'rollup-plugin-node-polyfills/polyfills/events'
        }
      },
      plugins: [
        // We need to "undefine" `define` which is set by requirejs loaded in index.html
        treatAsCommonjs() as any as PluginOption, // treatAsCommonjs currently returns a Plugin_2 instance
        {
          name: '@ownclouders/vite-plugin-strip-css',
          transform(src: string, id) {
            if (id.includes('lang.scss')) {
              const split = src.split(stripScssMarker)
              const newSrc = split[split.length - 1]
              return {
                code: newSrc,
                map: null
              }
            }
          }
        },
        EnvironmentPlugin({
          PACKAGE_VERSION: version
        }),
        vue(),
        viteStaticCopy({
          targets: [
            ...['fonts', 'icons'].map((name) => ({
              src: `packages/design-system/src/assets/${name}/*`,
              dest: `${name}`
            })),
            {
              src: `./packages/web-runtime/themes/*`,
              dest: `themes`
            },
            {
              src: `./config/vite_${configName}/*`,
              dest: ``
            },
            {
              src: 'node_modules/requirejs/require.js',
              dest: 'js'
            }
          ]
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
        },
        {
          name: 'ejs',
          transformIndexHtml: {
            enforce: 'pre',
            transform(html) {
              return ejs.render(html, {
                data: {
                  buildConfig,

                  title: process.env.TITLE || 'ownCloud',
                  compilationTimestamp: new Date().getTime(),
                  supportedBrowsersRegex: supportedBrowsersRegex
                }
              })
            }
          }
        },
        {
          name: 'import-map',
          transformIndexHtml: {
            transform(html, { bundle }) {
              // Build an import map for loading internal (as in: shipped and built within this mono repo) apps
              let moduleNames: string[]
              let re: RegExp
              let buildModulePath: any
              if (bundle) {
                moduleNames = Object.keys(bundle)
                // We are in production mode here and need to provide paths relative to the module that contains the import, i.e. web-runtime-*.mjs
                // so it works when oC Web is hosted in a sub folder, e.g. when using the oC 10 integration app
                // The regexp here needs to match the filenames defined in `build.rollupOptions.entryFileNames`
                re = new RegExp(/js\/(web-app-.*)-.*\.(.+)/)
                buildModulePath = (moduleName) => moduleName.replace('js/', './')
              } else {
                // We are in development mode here, so we can just use absolute module paths
                moduleNames = Object.keys(input)
                re = new RegExp(/(web-app-.*)/)
                buildModulePath = (moduleName) => `/packages/${moduleName}/src/index`
              }

              const map = Object.fromEntries(
                moduleNames
                  .map((m) => {
                    const appName = re.exec(m)?.[1]
                    if (appName) {
                      return [appName, buildModulePath(m)]
                    }
                  })
                  .filter(Boolean)
              )
              return [
                {
                  tag: 'script',
                  children: `window.WEB_APPS_MAP = ${JSON.stringify(map)}`
                }
              ]
            }
          }
        },
        process.env.REPORT !== 'true'
          ? null
          : visualizer({
              filename: join('dist', 'report.html')
            })
      ]
    },
    config
  )
})
