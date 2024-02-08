import { useGettext } from 'vue3-gettext'
import translations from '../l10n/translations.json'
import EpubReader from './App.vue'
import { AppWrapperRoute, defineWebApplication } from '@ownclouders/web-pkg'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()

    const appId = 'epub-reader'

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(EpubReader, {
          applicationId: appId,
          fileContentOptions: {
            responseType: 'blob'
          }
        }),
        name: 'epub-reader',
        meta: {
          authContext: 'hybrid',
          title: $gettext('Epub Reader'),
          patchCleanPath: true
        }
      }
    ]

    return {
      appInfo: {
        name: $gettext('Epub Reader'),
        id: appId,
        icon: 'book-read',
        extensions: [
          {
            extension: 'epub',
            routeName: 'epub-reader'
          }
        ]
      },
      routes,
      translations
    }
  }
})
