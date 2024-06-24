import {
  AppWrapperRoute,
  defineWebApplication,
  useCapabilityStore,
  useAppsStore,
  useClientService,
  useRequest,
  ComponentLoader
} from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import { stringify } from 'qs'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { join } from 'path'
import { AppListSchema } from './schemas'
import { useGettext } from 'vue3-gettext'

const appInfo = {
  name: 'External',
  id: 'external'
}

const routes = [
  {
    name: 'apps',
    path: '/:driveAliasAndItem(.*)?',
    component: ComponentLoader(async () => {
      const App = (await import('./App.vue')).default
      return AppWrapperRoute(App, {
        applicationId: appInfo.id
      })
    }),
    meta: {
      authContext: 'hybrid',
      patchCleanPath: true
    }
  }
]

export default defineWebApplication({
  setup() {
    const capabilityStore = useCapabilityStore()
    const appsStore = useAppsStore()
    const { makeRequest } = useRequest()
    const clientService = useClientService()
    const { $gettext } = useGettext()

    return {
      appInfo,
      routes,
      translations,
      ready: async () => {
        if (!capabilityStore.filesAppProviders[0]?.enabled) {
          return
        }

        const {
          data: { 'mime-types': mimeTypes }
        } = await clientService.httpUnAuthenticated.get(
          capabilityStore.filesAppProviders[0].apps_url,
          {
            schema: AppListSchema
          }
        )

        mimeTypes.forEach((mimeType) => {
          mimeType.app_providers.forEach((provider) => {
            appsStore.registerFileExtension({
              appId: 'external',
              data: {
                extension: mimeType.ext,
                label: $gettext('Open in %{app}', { app: provider.name }),
                icon: provider.icon,
                name: provider.name,
                mimeType: mimeType.mime_type,
                secureView: provider.secure_view,
                routeName: 'external-apps',
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
          })
        })
      }
    }
  }
})
