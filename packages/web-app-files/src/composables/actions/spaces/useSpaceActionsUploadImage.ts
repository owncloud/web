import { computed, unref, VNodeRef } from 'vue'
import { Store } from 'vuex'
import { SpaceResource } from 'web-client/src'
import { Drive } from 'web-client/src/generated'
import { useClientService, useLoadingService, useStore } from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { thumbnailService } from '../../../services'
import { useGettext } from 'vue3-gettext'
import { SpaceActionOptions } from 'web-pkg/src/composables/actions'

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

  let selectedSpace: SpaceResource = null
  const handler = ({ resources }: SpaceActionOptions) => {
    if (resources.length !== 1) {
      return
    }

    selectedSpace = resources[0] as SpaceResource
    unref(spaceImageInput)?.click()
  }

  const uploadImageSpace = (ev) => {
    const graphClient = clientService.graphAuthenticated
    const file = ev.currentTarget.files[0]

    if (!file) {
      return
    }

    if (!thumbnailService.isMimetypeSupported(file.type, true)) {
      return store.dispatch('showMessage', {
        title: $gettext('The file type is unsupported'),
        status: 'danger'
      })
    }

    const extraHeaders = {}
    if (file.lastModifiedDate) {
      extraHeaders['X-OC-Mtime'] = '' + file.lastModifiedDate.getTime() / 1000
    } else if (file.lastModified) {
      extraHeaders['X-OC-Mtime'] = '' + file.lastModified / 1000
    }

    return loadingService.addTask(() => {
      return clientService.owncloudSdk.files
        .putFileContents(`/spaces/${selectedSpace.id}/.space/${file.name}`, file, {
          headers: extraHeaders,
          overwrite: true
        })
        .then((image) => {
          return graphClient.drives
            .updateDrive(
              selectedSpace.id as string,
              {
                special: [
                  {
                    specialFolder: {
                      name: 'image'
                    },
                    id: image['OC-FileId']
                  }
                ]
              } as Drive,
              {}
            )
            .then(({ data }) => {
              store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
                id: selectedSpace.id as string,
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
          store.dispatch('showMessage', {
            title: $gettext('Failed to upload space image'),
            status: 'danger'
          })
        })
    })
  }

  const actions = computed(() => [
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
