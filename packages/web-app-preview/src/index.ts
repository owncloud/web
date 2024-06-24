import { AppWrapperRoute, ComponentLoader, defineWebApplication } from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import { useGettext } from 'vue3-gettext'
import { getMimeTypes } from './mimeTypes'

export default defineWebApplication({
  setup({ applicationConfig }) {
    const { $gettext } = useGettext()

    const appId = 'preview'

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: ComponentLoader(async () => {
          const App = (await import('./App.vue')).default
          return AppWrapperRoute(App, {
            applicationId: appId,
            urlForResourceOptions: {
              disposition: 'inline'
            }
          })
        }),
        name: 'media',
        meta: {
          authContext: 'hybrid',
          title: $gettext('Preview'),
          patchCleanPath: true
        }
      }
    ]

    const routeName = 'preview-media'

    const appInfo = {
      name: $gettext('Preview'),
      id: appId,
      icon: 'eye',
      extensions: getMimeTypes(applicationConfig?.mimeTypes).map((mimeType) => ({
        mimeType,
        routeName,
        label: $gettext('Preview')
      }))
    }

    return {
      appInfo,
      routes,
      translations
    }
  }
})
