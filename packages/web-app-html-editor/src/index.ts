import { useGettext } from 'vue3-gettext'
import translations from '../l10n/translations.json'
import HtmlEditor from './App.vue'
import {
  AppMenuItemExtension,
  AppWrapperRoute,
  ApplicationFileExtension,
  ApplicationInformation,
  defineWebApplication,
  useOpenEmptyEditor,
  useUserStore
} from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { urlJoin } from '@ownclouders/web-client'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const userStore = useUserStore()
    const { openEmptyEditor } = useOpenEmptyEditor()

    const appId = 'html-editor'

    const fileExtensions: ApplicationFileExtension[] = [
      {
        extension: 'html',
        label: () => $gettext('HTML file'),
        newFileMenu: {
          menuTitle() {
            return $gettext('HTML file')
          }
        }
      },
      {
        extension: 'htm',
        label: () => $gettext('HTML file')
      },
      {
        extension: 'xhtml',
        label: () => $gettext('XHTML file')
      }
    ]

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(HtmlEditor, {
          applicationId: appId
        }),
        name: 'html-editor',
        meta: {
          authContext: 'hybrid',
          title: $gettext('HTML Editor'),
          patchCleanPath: true
        }
      }
    ]

    const appInfo: ApplicationInformation = {
      name: $gettext('HTML Editor'),
      id: appId,
      icon: 'file-code',
      color: '#e34c26',
      defaultExtension: 'html',
      meta: {
        fileSizeLimit: 2000000
      },
      extensions: fileExtensions.map((extensionItem) => {
        return {
          extension: extensionItem.extension,
          ...(Object.prototype.hasOwnProperty.call(extensionItem, 'newFileMenu') && {
            newFileMenu: extensionItem.newFileMenu
          })
        }
      })
    }

    const menuItems = computed<AppMenuItemExtension[]>(() => {
      const items: AppMenuItemExtension[] = []

      if (userStore.user) {
        items.push({
          id: `app.${appInfo.id}.menuItem`,
          type: 'appMenuItem',
          label: () => appInfo.name,
          color: appInfo.color,
          icon: appInfo.icon,
          priority: 21,
          path: urlJoin(appInfo.id),
          handler: () => openEmptyEditor(appInfo.id, appInfo.defaultExtension)
        })
      }

      return items
    })

    return {
      appInfo,
      routes,
      translations,
      extensions: menuItems
    }
  }
})
