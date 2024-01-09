import { computed, unref, VNodeRef } from 'vue'
import { Store } from 'vuex'
import { SpaceResource } from '@ownclouders/web-client/src'
import { Drive } from '@ownclouders/web-client/src/generated'
import {
  useClientService,
  useLoadingService,
  useStore,
  usePreviewService,
  useUserStore,
  useMessages
} from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { SpaceAction, SpaceActionOptions } from '@ownclouders/web-pkg'
import { useCreateSpace } from '@ownclouders/web-pkg'
import { buildSpace } from '@ownclouders/web-client/src/helpers'

export const useSpaceActionsUploadImage = ({
  store,
  spaceImageInput
}: {
  store?: Store<any>
  spaceImageInput: VNodeRef
}) => {
  store = store || useStore()
  const userStore = useUserStore()
  const { showMessage, showErrorMessage } = useMessages()
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
      return showErrorMessage({ title: $gettext('The file type is unsupported') })
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

    return loadingService.addTask(async () => {
      // overwriting the content-type header only works if the provided content is not of type object,
      // therefore it has to be converted to a ArrayBuffer which allows the overwrite.
      //
      // https://github.com/perry-mitchell/webdav-client/blob/dd8d0dcc319297edc70077abd74b935361bc2412/source/tools/body.ts#L18
      const content = await file.arrayBuffer()
      const headers = {
        'Content-Type': 'application/offset+octet-stream'
      }

      if (file.lastModifiedDate) {
        headers['X-OC-Mtime'] = '' + file.lastModifiedDate.getTime() / 1000
      } else if (file.lastModified) {
        headers['X-OC-Mtime'] = '' + file.lastModified / 1000
      }

      try {
        const { fileId } = await clientService.webdav.putFileContents(selectedSpace, {
          path: `/.space/${file.name}`,
          content,
          headers,
          overwrite: true
        })

        const { data } = await graphClient.drives.updateDrive(
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

        store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
          id: selectedSpace.id.toString(),
          field: 'spaceImageData',
          value: data.special.find((special) => special.specialFolder.name === 'image')
        })
        showMessage({ title: $gettext('Space image was uploaded successfully') })
        eventBus.publish('app.files.spaces.uploaded-image', buildSpace(data))
      } catch (error) {
        console.error(error)
        showErrorMessage({
          title: $gettext('Failed to upload space image'),
          errors: [error]
        })
      }
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

        return resources[0].canEditImage({ user: userStore.user })
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
