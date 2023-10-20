import { computed, unref, VNodeRef } from 'vue'
import { Store } from 'vuex'
import { Resource, SpaceResource } from '@ownclouders/web-client/src'
import { Drive } from '@ownclouders/web-client/src/generated'
import {
  useClientService,
  useLoadingService,
  useStore,
  usePreviewService
} from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { SpaceAction, SpaceActionOptions } from '@ownclouders/web-pkg'
import { useCreateSpace } from '@ownclouders/web-pkg'

export const useSpaceActionsUploadImage = ({
  store,
  spaceImageInput
}: {
  store?: Store<any>
  spaceImageInput: VNodeRef
}) => {
  store = store || useStore()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const previewService = usePreviewService()
  const { createDefaultMetaFolder } = useCreateSpace()

  let selectedSpace: SpaceResource = null
  const handler = ({ resources }: SpaceActionOptions) => {
    if (resources.length !== 1) {
      return
    }

    selectedSpace = resources[0] as SpaceResource
    unref(spaceImageInput)?.click()
  }

  const uploadImageSpace = async (ev) => {
    const graphClient = clientService.graphAuthenticated
    const file = ev.currentTarget.files[0]

    if (!file) {
      return
    }

    if (!previewService.isMimetypeSupported(file.type, true)) {
      return store.dispatch('showErrorMessage', {
        title: $gettext('The file type is unsupported')
      })
    }

    const extraHeaders = {}
    if (file.lastModifiedDate) {
      extraHeaders['X-OC-Mtime'] = '' + file.lastModifiedDate.getTime() / 1000
    } else if (file.lastModified) {
      extraHeaders['X-OC-Mtime'] = '' + file.lastModified / 1000
    }

    try {
      await clientService.webdav.getFileInfo(selectedSpace, { path: '.space' })
    } catch (_) {
      store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
        id: selectedSpace.id,
        field: 'spaceReadmeData',
        value: (await createDefaultMetaFolder(selectedSpace)).spaceReadmeData
      })
    }

    return loadingService.addTask(() => {
      return clientService.webdav
        .putFileContents(selectedSpace, {
          path: `/.space/${file.name}`,
          content: file,
          headers: extraHeaders,
          overwrite: true
        })
        .then(({ fileId }: Resource) => {
          return graphClient.drives
            .updateDrive(
              selectedSpace.id.toString(),
              {
                special: [
                  {
                    specialFolder: {
                      name: 'image'
                    },
                    id: fileId
                  }
                ]
              } as Drive,
              {}
            )
            .then(({ data }) => {
              store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
                id: selectedSpace.id.toString(),
                field: 'spaceImageData',
                value: data.special.find((special) => special.specialFolder.name === 'image')
              })
              store.dispatch('showMessage', {
                title: $gettext('Space image was uploaded successfully')
              })
              eventBus.publish('app.files.list.load')
            })
        })
        .catch((error) => {
          console.error(error)
          store.dispatch('showErrorMessage', {
            title: $gettext('Failed to upload space image'),
            error
          })
        })
    })
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'upload-space-image',
      icon: 'image-add',
      handler,
      label: () => {
        return $gettext('Edit image')
      },
      isEnabled: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }

        return resources[0].canEditImage({ user: store.getters.user })
      },
      componentType: 'button',
      class: 'oc-files-actions-upload-space-image-trigger'
    }
  ])

  return {
    actions,
    uploadImageSpace
  }
}
