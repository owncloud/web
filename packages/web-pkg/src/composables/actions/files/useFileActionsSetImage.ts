import { isLocationSpacesActive } from '../../../router'
import { usePreviewService } from '../../previewService'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { useGettext } from 'vue3-gettext'
import { computed } from 'vue'
import { FileAction, FileActionOptions } from '../types'
import { useMessages, useSpacesStore, useUserStore } from '../../piniaStores'

export const useFileActionsSetImage = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const userStore = useUserStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const previewService = usePreviewService()
  const spacesStore = useSpacesStore()

  const handler = async ({ space, resources }: FileActionOptions) => {
    const graphClient = clientService.graphAuthenticated
    const storageId = space?.id as string
    const sourcePath = resources[0].path
    const destinationPath = `/.space/${resources[0].name}`
    const { copyFiles, getFileInfo, createFolder } = clientService.webdav

    try {
      try {
        await getFileInfo(space, { path: '.space' })
      } catch (_) {
        await createFolder(space, { path: '.space' })
      }

      if (sourcePath !== destinationPath) {
        await copyFiles(
          space,
          { path: sourcePath },
          space,
          { path: destinationPath },
          { overwrite: true }
        )
      }

      const file = await getFileInfo(space, { path: destinationPath })

      const updatedSpace = await graphClient.drives.updateDrive(storageId, {
        name: space.name,
        special: [{ specialFolder: { name: 'image' }, id: file.id }]
      })

      spacesStore.updateSpaceField({
        id: storageId,
        field: 'spaceImageData',
        value: updatedSpace.spaceImageData
      })

      showMessage({ title: $gettext('Space image was set successfully') })
    } catch (error) {
      console.error(error)
      showErrorMessage({
        title: $gettext('Failed to set space image'),
        errors: [error]
      })
    }
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'set-space-image',
      icon: 'image-edit',
      handler: (args) => loadingService.addTask(() => handler(args)),
      label: () => {
        return $gettext('Set as space image')
      },
      isVisible: ({ space, resources }) => {
        if (resources.length !== 1) {
          return false
        }
        if (!resources[0].mimeType) {
          return false
        }
        if (!previewService.isMimetypeSupported(resources[0].mimeType, true)) {
          return false
        }

        if (!isLocationSpacesActive(router, 'files-spaces-generic')) {
          return false
        }
        if (!space) {
          return false
        }

        return space.canEditImage({ user: userStore.user })
      },
      componentType: 'button',
      class: 'oc-files-actions-set-space-image-trigger'
    }
  ])

  return {
    actions
  }
}
