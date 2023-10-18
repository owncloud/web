import { Resource } from '@ownclouders/web-client/src'
import { AppWrapperRoute } from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import App from './App.vue'
import { Store } from 'vuex'

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
  color: '#EF6C00',
  applicationMenu: {
    enabled: (store: Store<unknown>) => {
      return !!store.getters?.user?.id
    },
    priority: 30,
    openAsEditor: true
  },
  defaultExtension: 'drawio',
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
