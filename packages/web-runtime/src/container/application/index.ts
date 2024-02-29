import { Router } from 'vue-router'
import { NextApplication } from './next'
import { convertClassicApplication } from './classic'
import { RuntimeError, ConfigStore } from '@ownclouders/web-pkg'
import { applicationStore } from '../store'
import { isObject } from 'lodash-es'
import type { Language } from 'vue3-gettext'

// import modules to provide them to applications
import * as vue from 'vue' // eslint-disable-line
import * as luxon from 'luxon' // eslint-disable-line
import * as vueGettext from 'vue3-gettext' // eslint-disable-line
import * as pinia from 'pinia' // eslint-disable-line
import * as webPkg from '@ownclouders/web-pkg'
import * as webClient from '@ownclouders/web-client'

import { urlJoin } from '@ownclouders/web-client/src/utils'
import { App } from 'vue'
import { AppConfigObject, ClassicApplicationScript } from '@ownclouders/web-pkg'

export { NextApplication } from './next'

// shim requirejs, trust me it's there... :
const { requirejs, define } = window as any

// register modules with requirejs to provide them to applications
// keep in sync with packages/extension-sdk/index.mjs
const injectionMap = {
  luxon,
  pinia,
  vue,
  'vue3-gettext': vueGettext,
  '@ownclouders/web-pkg': webPkg,
  '@ownclouders/web-client': webClient,
  'web-pkg': webPkg,
  'web-client': webClient
}

for (const [key, value] of Object.entries(injectionMap)) {
  define(key, () => value)
}

const loadScriptDynamicImport = async <T>(moduleUri: string) => {
  return ((await import(/* @vite-ignore */ moduleUri)) as any).default as T
}

const loadScriptRequireJS = <T>(moduleUri: string) => {
  return new Promise<T>((resolve, reject) =>
    requirejs(
      [moduleUri],
      (app) => resolve(app),
      (err) => reject(err)
    )
  )
}
/**
 * sniffs arguments and decides if given manifest is of next or current application style.
 *
 * @param args
 */
export const buildApplication = async ({
  app,
  applicationPath,
  applicationConfig,
  router,
  gettext,
  supportedLanguages,
  configStore
}: {
  app: App
  applicationPath: string
  applicationConfig: AppConfigObject
  router: Router
  gettext: Language
  supportedLanguages: { [key: string]: string }
  configStore: ConfigStore
}): Promise<NextApplication> => {
  if (applicationStore.has(applicationPath)) {
    throw new RuntimeError('application already announced', applicationPath)
  }

  let applicationScript: ClassicApplicationScript
  try {
    if (applicationPath.includes('/')) {
      if (
        !applicationPath.startsWith('http://') &&
        !applicationPath.startsWith('https://') &&
        !applicationPath.startsWith('//')
      ) {
        applicationPath = urlJoin(configStore.serverUrl, applicationPath)
      }

      if (applicationPath.endsWith('.mjs') || applicationPath.endsWith('.ts')) {
        applicationScript = await loadScriptDynamicImport<ClassicApplicationScript>(applicationPath)
      } else {
        applicationScript = await loadScriptRequireJS<ClassicApplicationScript>(applicationPath)
      }
    } else {
      const productionModule = window.WEB_APPS_MAP?.[applicationPath]
      if (productionModule) {
        applicationScript =
          await loadScriptDynamicImport<ClassicApplicationScript>(productionModule)
      } else {
        throw new RuntimeError(
          'cannot load application as only a name (and no path) is given and that name is not known to the application import map'
        )
      }
    }
  } catch (e) {
    console.trace(e)
    throw new RuntimeError('cannot load application', applicationPath, e)
  }

  let application: NextApplication

  try {
    /** add valuable sniffer to detect next applications, then implement next application factory */
    if (!isObject(applicationScript.appInfo) && !applicationScript.setup) {
      throw new RuntimeError('next applications not implemented yet, stay tuned')
    } else {
      application = convertClassicApplication({
        app,
        applicationScript,
        applicationConfig,
        router,
        gettext,
        supportedLanguages
      })
    }
  } catch (err) {
    throw new RuntimeError('cannot create application', err.message, applicationPath)
  }

  applicationStore.set(applicationPath, application)

  return application
}
