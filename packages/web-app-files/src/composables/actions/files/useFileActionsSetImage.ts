import { isLocationSpacesActive } from '../../../router'
import { useThumbnailService } from '../../'
import { Store } from 'vuex'
import { useClientService, useLoadingService, useRouter, useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { computed } from 'vue'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'

export const useFileActionsSetImage = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const thumbnailService = useThumbnailService()

  const handler = async ({ space, resources }: FileActionOptions) => {
    const graphClient = clientService.graphAuthenticated
    const storageId = space?.id as string
    const sourcePath = resources[0].path
    const destinationPath = `/.space/${resources[0].name}`
    const { copyFiles, getFileInfo } = clientService.webdav

    try {
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
      const { data } = await graphClient.drives.updateDrive(
        storageId,
        {
          name: space.name,
          special: [
            {
              specialFolder: {
                name: 'image'
              },
              id: file.id as string
            }
          ]
        },
        {}
      )

      store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
        id: storageId,
        field: 'spaceImageData',
        value: data.special.find((special) => special.specialFolder.name === 'image')
      })

      store.dispatch('showMessage', {
        title: $gettext('Space image was set successfully')
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showMessage', {
        title: $gettext('Failed to set space image'),
        status: 'danger'
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
      isEnabled: ({ space, resources }) => {
        if (resources.length !== 1) {
          return false
        }
        if (!resources[0].mimeType) {
          return false
        }
        if (!thumbnailService.isMimetypeSupported(resources[0].mimeType, true)) {
          return false
        }

        if (!isLocationSpacesActive(router, 'files-spaces-generic')) {
          return false
        }
        if (!space) {
          return false
        }

        return space.canEditImage({ user: store.getters.user })
      },
      canBeDefault: false,
      componentType: 'button',
      class: 'oc-files-actions-set-space-image-trigger'
    }
  ])

  return {
    actions
  }
}
