import { useGettext } from 'vue3-gettext'
import translations from '../l10n/translations.json'
import JupyterViewer from './App.vue'
import {
  AppWrapperRoute,
  ApplicationFileExtension,
  defineWebApplication,
  useUserStore
} from '@ownclouders/web-pkg'

export default defineWebApplication({
  setup({ applicationConfig }) {
    const { $gettext } = useGettext()
    const userStore = useUserStore()

    const appId = 'jupyter-viewer'

    const fileExtensions = () => {
      const extensions: ApplicationFileExtension[] = [
        {
          extension: 'ipynb',
          label: $gettext('Jupyter notebook')
        }
      ]

      const config = applicationConfig || {}
      extensions.push(...(config.extraExtensions || []).map((ext: string) => ({ extension: ext })))

      let primaryExtensions: string[] = config.primaryExtensions || ['ipynb']

      if (typeof primaryExtensions === 'string') {
        primaryExtensions = [primaryExtensions]
      }

      return extensions
    }

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(JupyterViewer, {
          applicationId: appId
        }),
        name: 'jupyter-viewer',
        meta: {
          authContext: 'hybrid',
          title: $gettext('Jupyter Viewer'),
          patchCleanPath: true
        }
      }
    ]

    return {
      appInfo: {
        name: $gettext('Jupyter Viewer'),
        id: appId,
        icon: 'jupyter',
        color: '#0D856F',
        isFileEditor: false,
        applicationMenu: {
          enabled: () => {
            return !!userStore.user
          },
          priority: 20,
          openAsEditor: true
        },
        defaultExtension: 'ipynb',
        extensions: fileExtensions().map((extensionItem) => {
          return {
            extension: extensionItem.extension
          }
        })
      },
      routes,
      translations
    }
  }
})
