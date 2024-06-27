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
import Redirect from './Redirect.vue'
import { useApplicationReadyStore } from './piniaStores'

export default defineWebApplication({
  setup(options: any) {
    const capabilityStore = useCapabilityStore()
    const { makeRequest } = useRequest()
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const appProviderService = useAppProviderService()

    if (!Object.hasOwn(options, 'appName')) {
      const appInfo: ApplicationInformation = {
        name: $gettext('External'),
        id: 'external'
      }
      const routes = [
        {
          // catch-all route for page reloads, because dynamic external app routes are not available immediately on page reload.
          // can be deleted as soon as app provider apps are not loaded after login anymore (app provider listing endpoint must be hardcoded and public)
          name: 'catch-all',
          path: '-:appCatchAll/:driveAliasAndItem(.*)?',
          component: Redirect,
          meta: {
            authContext: 'hybrid',
            title: $gettext('Redirecting to external app'),
            patchCleanPath: true
          }
        },
        {
          // fallback route for old external-app URLs, in case someone made a bookmark. Can be removed with the next major release.
          name: 'apps',
          path: '/:driveAliasAndItem(.*)?',
          component: Redirect,
          meta: {
            authContext: 'hybrid',
            title: $gettext('Redirecting to external app'),
            patchCleanPath: true
          }
        }
      ]
      return {
        appInfo,
        routes,
        ready: () => {
          const applicationReadyStore = useApplicationReadyStore()
          applicationReadyStore.setReady()
        }
      }
    }

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
