import { useGettext } from 'vue3-gettext'
import translations from '../l10n/translations.json'
import EpubReader from './App.vue'
import {
  AppWrapperRoute,
  ApplicationFileExtension,
  defineWebApplication
} from '@ownclouders/web-pkg'

export default defineWebApplication({
  setup({ applicationConfig }) {
    const { $gettext } = useGettext()

    const appId = 'epub-reader'

    const fileExtensions = () => {
      const extensions: ApplicationFileExtension[] = [
        {
          extension: 'epub',
          label: $gettext('EPUB file')
        }
      ]

      const config = applicationConfig || {}
      extensions.push(...(config.extraExtensions || []).map((ext: string) => ({ extension: ext })))

      let primaryExtensions: string[] = config.primaryExtensions || ['epub']

      if (typeof primaryExtensions === 'string') {
        primaryExtensions = [primaryExtensions]
      }

      return extensions.reduce<ApplicationFileExtension[]>((acc, extensionItem) => {
        const isPrimary = primaryExtensions.includes(extensionItem.extension)
        if (isPrimary) {
          extensionItem.newFileMenu = {
            menuTitle() {
              return $gettext(extensionItem.label)
            }
          }
        }
        acc.push(extensionItem)
        return acc
      }, [])
    }

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
        icon: 'file-text',
        color: '#0D856F',
        isFileEditor: true,
        defaultExtension: 'epub',
        extensions: fileExtensions().map((extensionItem) => {
          return {
            extension: extensionItem.extension,
            ...(Object.hasOwn(extensionItem, 'newFileMenu') && {
              newFileMenu: extensionItem.newFileMenu
            })
          }
        })
      },
      routes,
      translations
    }
  }
})
