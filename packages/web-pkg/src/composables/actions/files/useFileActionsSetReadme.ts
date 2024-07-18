import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { FileAction, FileActionOptions } from '../types'
import { useMessages, useSpacesStore, useUserStore } from '../../piniaStores'
import { useCreateSpace } from '../../spaces'

export const useFileActionsSetReadme = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const userStore = useUserStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const spacesStore = useSpacesStore()
  const { createDefaultMetaFolder } = useCreateSpace()

  const handler = async ({ space, resources }: FileActionOptions) => {
    try {
      const { graphAuthenticated, webdav } = clientService
      const fileContent = (await webdav.getFileContents(space, { path: resources[0].path })).body

      try {
        await webdav.getFileInfo(space, { path: '.space' })
      } catch (_) {
        await createDefaultMetaFolder(space)
      }

      await webdav.putFileContents(space, {
        path: `/.space/readme.md`,
        content: fileContent
      })
      const file = await webdav.getFileInfo(space, { path: '.space/readme.md' })
      const updatedSpace = await graphAuthenticated.drives.updateDrive(space.id, {
        name: space.name,
        special: [{ specialFolder: { name: 'readme' }, id: file.id }]
      })

      spacesStore.updateSpaceField({
        id: space.id,
        field: 'spaceReadmeData',
        value: updatedSpace.spaceReadmeData
      })
      showMessage({ title: $gettext('Space description was set successfully') })
    } catch (error) {
      console.error(error)
      showErrorMessage({
        title: $gettext('Failed to set space description'),
        errors: [error]
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
      isVisible: ({ space, resources }) => {
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

        return space.canEditReadme({ user: userStore.user })
      },
      componentType: 'button',
      class: 'oc-files-actions-set-space-readme-trigger'
    }
  ])

  return {
    actions
  }
}
