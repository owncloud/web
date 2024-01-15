import { defineWebApplication } from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import * as app from './App.vue'
import { useGettext } from 'vue3-gettext'
import { getMimeTypes } from './mimeTypes'

const { default: App, appId } = app as any

export default defineWebApplication({
  setup({ applicationConfig }) {
    const { $gettext } = useGettext()

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: App,
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
