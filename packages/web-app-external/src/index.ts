import {
  AppWrapperRoute,
  defineWebApplication,
  useCapabilityStore,
  useClientService,
  useRequest,
  ApplicationInformation
} from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import App from './App.vue'
import { stringify } from 'qs'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { join } from 'path'
import { useGettext } from 'vue3-gettext'
import { useAppProviderService } from '@ownclouders/web-pkg/src/composables/appProviderService'

export default defineWebApplication({
  setup(options: any) {
    if (!Object.hasOwn(options, 'appName')) {
      throw new Error('appName is required for the external app')
    }

    const capabilityStore = useCapabilityStore()
    const { makeRequest } = useRequest()
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const appProviderService = useAppProviderService()

    const { appName } = options
    const appId = `external-${appName.toLowerCase()}`
    const mimeTypes = appProviderService.getMimeTypesByAppName(appName)
    const appInfo: ApplicationInformation = {
      name: appName,
      id: appId,
      isFileEditor: true,
      extensions: mimeTypes.map((mimeType) => {
        const provider = mimeType.app_providers.find((provider) => provider.name === appName)
        return {
          extension: mimeType.ext,
          label: $gettext('Open in %{app}', { app: provider.name }),
          icon: provider.icon,
          name: provider.name,
          mimeType: mimeType.mime_type,
          secureView: provider.secure_view,
          routeName: `${appId}-apps`,
          hasPriority: mimeType.default_application === provider.name,
          ...(mimeType.allow_creation && { newFileMenu: { menuTitle: () => mimeType.name } }),
          createFileHandler: async ({
            fileName,
            space,
            currentFolder
          }: {
            fileName: string
            space: SpaceResource
            currentFolder: Resource
          }) => {
            if (fileName === '') {
              return
            }

            const query = stringify({
              parent_container_id: currentFolder.fileId,
              filename: fileName
            })
            const url = `${capabilityStore.filesAppProviders[0].new_url}?${query}`
            const response = await makeRequest('POST', url)
            if (response.status !== 200) {
              throw new Error(`An error has occurred: ${response.status}`)
            }

            const path = join(currentFolder.path, fileName) || ''
            return clientService.webdav.getFileInfo(space, { path })
          }
        }
      })
    }

    const routes = [
      {
        name: 'apps',
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(App, {
          applicationId: appInfo.id
        }),
        meta: {
          authContext: 'hybrid',
          title: appName,
          patchCleanPath: true
        }
      }
    ]

    return {
      appInfo,
      routes,
      translations
    }
  }
})
