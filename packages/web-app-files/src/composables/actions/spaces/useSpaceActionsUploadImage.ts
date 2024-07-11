import { computed, unref, VNodeRef } from 'vue'
import { SpaceResource } from '@ownclouders/web-client'
import { Drive } from '@ownclouders/web-client/graph/generated'
import {
  useClientService,
  useLoadingService,
  usePreviewService,
  useUserStore,
  useMessages,
  useSpacesStore,
  useSpaceHelpers
} from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { SpaceAction, SpaceActionOptions } from '@ownclouders/web-pkg'
import { useCreateSpace } from '@ownclouders/web-pkg'
import { buildSpace } from '@ownclouders/web-client'

export const useSpaceActionsUploadImage = ({ spaceImageInput }: { spaceImageInput: VNodeRef }) => {
  const userStore = useUserStore()
  const { showMessage, showErrorMessage } = useMessages()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const previewService = usePreviewService()
  const spacesStore = useSpacesStore()
  const { createDefaultMetaFolder } = useCreateSpace()
  const { getDefaultMetaFolder } = useSpaceHelpers()

  let selectedSpace: SpaceResource = null
  const handler = ({ resources }: SpaceActionOptions) => {
    if (resources.length !== 1) {
      return
    }

    selectedSpace = resources[0] as SpaceResource
    unref(spaceImageInput)?.click()
  }

  const uploadImageSpace = async (ev: Event) => {
    const graphClient = clientService.graphAuthenticated
    const file = (ev.currentTarget as HTMLInputElement).files[0]

    if (!file) {
      return
    }

    if (!previewService.isMimetypeSupported(file.type, true)) {
      return showErrorMessage({ title: $gettext('The file type is unsupported') })
    }

    let metaFolder = await getDefaultMetaFolder(selectedSpace)
    if (!metaFolder) {
      metaFolder = await createDefaultMetaFolder(selectedSpace, metaFolder.id)
    }

    return loadingService.addTask(async () => {
      // overwriting the content-type header only works if the provided content is not of type object,
      // therefore it has to be converted to a ArrayBuffer which allows the overwrite.
      //
      // https://github.com/perry-mitchell/webdav-client/blob/dd8d0dcc319297edc70077abd74b935361bc2412/source/tools/body.ts#L18
      const content = await file.arrayBuffer()
      const headers: Record<string, string> = {
        'Content-Type': 'application/offset+octet-stream'
      }

      if (file.lastModified) {
        headers['X-OC-Mtime'] = '' + file.lastModified / 1000
      }

      try {
        const { fileId } = await clientService.webdav.putFileContents(selectedSpace, {
          fileId: metaFolder.id,
          fileName: file.name,
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

        spacesStore.updateSpaceField({
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
      isVisible: ({ resources }) => {
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
