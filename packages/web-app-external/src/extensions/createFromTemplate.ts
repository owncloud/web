import {
  ActionExtension,
  EDITOR_MODE_EDIT,
  FileAction,
  resolveFileNameDuplicate,
  useAppProviderService,
  useClientService,
  useFileActions,
  useMessages,
  useRouter,
  useSpacesStore
} from '@ownclouders/web-pkg'
import { unref } from 'vue'
import { extractNameWithoutExtension, Resource } from '@ownclouders/web-client'
import { useCreateFileHandler } from '../composables'
import { useGettext } from 'vue3-gettext'

export const useActionExtensionCreateFromTemplate = (): ActionExtension => {
  const appProviderService = useAppProviderService()
  const spacesStore = useSpacesStore()
  const clientService = useClientService()
  const router = useRouter()
  const { createFileHandler } = useCreateFileHandler()
  const { getEditorRouteOpts } = useFileActions()
  const { $gettext } = useGettext()
  const { showErrorMessage } = useMessages()

  const action: FileAction = {
    name: 'create-from-template',
    category: 'context',
    label: () => $gettext('Create from template'),
    icon: 'swap-box',
    hasPriority: true,
    isVisible: ({ resources }) => {
      if (resources.length !== 1) {
        return false
      }

      // for the time being, documents get created in the personal space.
      // hence, only available to users with personal space.
      if (!spacesStore.personalSpace) {
        return false
      }

      const template = resources[0]
      if (!template.canDownload()) {
        return false
      }

      const templateMimeType = appProviderService.templateMimeTypes.find(
        (mimeType) => mimeType.mime_type === template.mimeType
      )
      return !!templateMimeType
    },
    handler: async ({ resources }) => {
      const existingResourcesPromise = clientService.webdav.listFiles(spacesStore.personalSpace, {
        fileId: spacesStore.personalSpace.fileId
      })
      const template = resources[0]
      const templateMimeType = appProviderService.templateMimeTypes.find(
        (mimeType) => mimeType.mime_type === template.mimeType
      )
      const firstApp = templateMimeType.app_providers.find(
        (appProvider) => !!appProvider.target_ext
      )

      let fileName =
        extractNameWithoutExtension({
          name: template.name,
          extension: template.extension
        } as Resource) + `.${firstApp.target_ext}`

      try {
        const { resource: personalSpaceRoot, children: existingResources } =
          await existingResourcesPromise
        if (existingResources.some((f) => f.name === fileName)) {
          fileName = resolveFileNameDuplicate(
            fileName,
            firstApp.target_ext,
            unref(existingResources)
          )
        }

        const createdFile = await createFileHandler({
          fileName,
          space: spacesStore.personalSpace,
          currentFolder: personalSpaceRoot
        })

        const routeName = `external-${firstApp.name.toLowerCase()}-apps`
        const routeOptions = getEditorRouteOpts(
          routeName,
          spacesStore.personalSpace,
          createdFile,
          EDITOR_MODE_EDIT,
          undefined,
          template.fileId
        )
        await router.push(routeOptions)
      } catch (e) {
        // TODO: can we get more specific with error titles?
        console.error(e)
        showErrorMessage({
          title: $gettext('Failed to create document from template'),
          errors: [e]
        })
      }
    }
  }
  return {
    id: 'com.github.owncloud.web.external.action.create-from-template',
    extensionPointIds: ['global.files.context-actions', 'global.files.default-actions'],
    type: 'action',
    action
  }
}
