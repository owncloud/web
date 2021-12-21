import { Store } from 'vuex'
import VueRouter from 'vue-router'
import { NextApplication } from './next'
import { convertClassicApplication } from './classic'
import { ClassicApplicationScript } from '../types'
import { RuntimeError } from '../error'
import { applicationStore } from '../store'
import { isObject } from 'lodash-es'
export { NextApplication } from './next'

/** shim requirejs, trust me it's there... :( */
const requirejs = (window as any).requirejs

/**
 * sniffs arguments and decides if given manifest is of next or current application style.
 *
 * @param args
 */
export const buildApplication = async ({
  applicationPath,
  store,
  router,
  translations,
  supportedLanguages
}: {
  applicationPath: string
  store: Store<unknown>
  router: VueRouter
  translations: unknown
  supportedLanguages: { [key: string]: string }
}): Promise<NextApplication> => {
  if (applicationStore.has(applicationPath)) {
    throw new RuntimeError('application already announced', applicationPath)
  }

  const applicationScript: ClassicApplicationScript = await new Promise((resolve, reject) =>
    requirejs(
      [applicationPath],
      (app) => resolve(app),
      (err) => reject(err)
    )
  ).catch((e) => {
    console.error(e)
    throw new RuntimeError('cannot load application', applicationPath)
  })

  let application: NextApplication

  try {
    /** add valuable sniffer to detect next applications, then implement next application factory */
    if (!isObject(applicationScript.appInfo)) {
      throw new RuntimeError('next applications not implemented yet, stay tuned')
    } else {
      application = await convertClassicApplication({
        applicationScript,
        store,
        router,
        translations,
        supportedLanguages
      }).catch()
    }
  } catch (err) {
    throw new RuntimeError('cannot create application', err.message, applicationPath)
  }

  applicationStore.set(applicationPath, application)

  return application
}
