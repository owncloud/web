import { useGettext } from 'vue3-gettext'
import translations from '../l10n/translations.json'
import TextEditor from './App.vue'
import { AppWrapperRoute, defineWebApplication, useUserStore } from '@ownclouders/web-pkg'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const userStore = useUserStore()

    const appId = 'text-editor'

    const fileExtensions = () => {
      const extensions: {
        extension: string
        label: string
        newFileMenu?: any
      }[] = [
        {
          extension: 'txt',
          label: $gettext('Plain text file')
        },
        {
          extension: 'md',
          label: $gettext('Markdown file')
        },
        {
          extension: 'js',
          label: $gettext('JavaScript file')
        },
        {
          extension: 'json',
          label: $gettext('JSON file')
        },
        {
          extension: 'xml',
          label: $gettext('XML file')
        },
        {
          extension: 'py',
          label: $gettext('Python file')
        },
        {
          extension: 'php',
          label: $gettext('PHP file')
        },
        {
          extension: 'yaml',
          label: $gettext('YAML file')
        }
      ]

      const config = (window as any).__$store.getters.extensionConfigByAppId(appId)
      extensions.push(...(config.extraExtensions || []).map((ext) => ({ extension: ext })))

      let primaryExtensions = (window as any).__$store.getters.extensionConfigByAppId(appId)
        .primaryExtensions || ['txt', 'md']

      if (typeof primaryExtensions === 'string') {
        primaryExtensions = [primaryExtensions]
      }

      return extensions.reduce((acc, extensionItem) => {
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
        component: AppWrapperRoute(TextEditor, {
          applicationId: appId
        }),
        name: 'text-editor',
        meta: {
          authContext: 'hybrid',
          title: $gettext('Text Editor'),
          patchCleanPath: true
        }
      }
    ]

    return {
      appInfo: {
        name: $gettext('Text Editor'),
        id: appId,
        icon: 'file-text',
        color: '#0D856F',
        isFileEditor: true,
        applicationMenu: {
          enabled: () => {
            return !!userStore.user
          },
          priority: 20,
          openAsEditor: true
        },
        defaultExtension: 'txt',
        extensions: fileExtensions().map((extensionItem) => {
          return {
            extension: extensionItem.extension,
            ...(Object.prototype.hasOwnProperty.call(extensionItem, 'newFileMenu') && {
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
