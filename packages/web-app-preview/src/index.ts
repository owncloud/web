import { AppWrapperRoute, defineWebApplication } from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import * as app from './App.vue'
import { useGettext } from 'vue3-gettext'
import { mimeTypes } from './mimeTypes'

const { default: App, appId } = app

export default defineWebApplication({
  setup({ applicationConfig }) {
    const { $gettext } = useGettext()

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(App, {
          applicationId: appId,
          urlForResourceOptions: {
            disposition: 'inline'
          }
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
      extensions: mimeTypes.map((mimeType) => ({
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
