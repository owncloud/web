import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Store } from 'vuex'
import { useClientService, useRouter, useStore } from 'web-pkg/src/composables'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { Drive } from 'web-client/src/generated'
import { buildSpace } from 'web-client/src/helpers'

export const useFileActionsSetReadme = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()

  const handler = async ({ space, resources }: FileActionOptions) => {
    try {
      const { owncloudSdk, graphAuthenticated, webdav } = clientService
      const fileContent = await owncloudSdk.files.getFileContents(resources[0].webDavPath)

      try {
        await webdav.getFileInfo(space, { path: '.space' })
      } catch (_) {
        await webdav.createFolder(space, { path: '.space' })
      }

      await owncloudSdk.files.putFileContents(`/spaces/${space.id}/.space/readme.md`, fileContent)
      const file = await webdav.getFileInfo(space, { path: '.space/readme.md' })

      const { data: updatedDriveData } = await graphAuthenticated.drives.updateDrive(
        space.id as string,
        {
          special: [
            {
              specialFolder: {
                name: 'readme'
              },
              id: file.id
            }
          ]
        } as Drive,
        {}
      )
      store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
        id: space.id,
        field: 'spaceReadmeData',
        value: buildSpace(updatedDriveData).spaceReadmeData
      })
      store.dispatch('showMessage', {
        title: $gettext('Space description was set successfully')
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showMessage', {
        title: $gettext('Failed to set space description'),
        status: 'danger'
      })
    }
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'set-space-readme',
      icon: 'markdown',
      handler,
      label: () => {
        return $gettext('Set as space description')
      },
      isEnabled: ({ space, resources }) => {
        if (resources.length !== 1) {
          return false
        }
        if (!resources[0].mimeType?.startsWith('text/')) {
          return false
        }
        if (unref(router.currentRoute).name !== 'files-spaces-generic') {
          return false
        }

        if (!space) {
          return false
        }

        return space.canEditReadme({ user: store.getters.user })
      },
      componentType: 'button',
      class: 'oc-files-actions-set-space-readme-trigger'
    }
  ])

  return {
    actions
  }
}
