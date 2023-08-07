import { Resource } from 'web-client/src'
import { AppWrapperRoute } from 'web-pkg/src/components/AppTemplates/AppWrapperRoute'
import translations from '../l10n/translations.json'
import App from './App.vue'

const applicationId = 'draw-io'

const routes = [
  {
    name: 'draw-io',
    path: '/:driveAliasAndItem(.*)?',
    component: AppWrapperRoute(App, {
      applicationId,
      importResourceWithExtension(resource: Resource) {
        return resource.extension === 'vsdx' ? 'drawio' : null
      }
    }),
    meta: {
      authContext: 'hybrid',
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: 'Draw.io',
  id: applicationId,
  icon: 'grid',
  extensions: [
    {
      extension: 'drawio',
      routeName: 'draw-io',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('Draw.io document')
        }
      }
    },
    {
      extension: 'vsdx',
      routeName: 'draw-io'
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
