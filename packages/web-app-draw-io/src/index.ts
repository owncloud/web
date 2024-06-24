import { Resource } from '@ownclouders/web-client'
import {
  AppWrapperRoute,
  ComponentLoader,
  defineWebApplication,
  useUserStore
} from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import { useGettext } from 'vue3-gettext'

const applicationId = 'draw-io'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const userStore = useUserStore()

    const routes = [
      {
        name: 'draw-io',
        path: '/:driveAliasAndItem(.*)?',
        component: ComponentLoader(async () => {
          const App = (await import('./App.vue')).default
          return AppWrapperRoute(App, {
            applicationId,
            importResourceWithExtension(resource: Resource) {
              return resource.extension === 'vsdx' ? 'drawio' : null
            }
          })
        }),
        meta: {
          authContext: 'hybrid',
          patchCleanPath: true
        }
      }
    ]

    return {
      appInfo: {
        name: 'Draw.io',
        id: applicationId,
        icon: 'grid',
        color: '#EF6C00',
        applicationMenu: {
          enabled: () => {
            return !!userStore.user
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
              menuTitle() {
                return $gettext('Draw.io document')
              }
            }
          },
          {
            extension: 'vsdx',
            routeName: 'draw-io'
          }
        ]
      },
      routes,
      translations
    }
  }
})
