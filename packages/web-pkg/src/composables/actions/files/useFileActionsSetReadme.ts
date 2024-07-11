import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { FileAction, FileActionOptions } from '../types'
import { Drive } from '@ownclouders/web-client/graph/generated'
import { buildSpace } from '@ownclouders/web-client'
import { useMessages, useSpacesStore, useUserStore } from '../../piniaStores'
import { useCreateSpace, useSpaceHelpers } from '../../spaces'

export const useFileActionsSetReadme = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const userStore = useUserStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const spacesStore = useSpacesStore()
  const { createDefaultMetaFolder } = useCreateSpace()
  const { getDefaultMetaFolder } = useSpaceHelpers()

  const handler = async ({ space, resources }: FileActionOptions) => {
    try {
      const { graphAuthenticated, webdav } = clientService
      const fileContent = (await webdav.getFileContents(space, { fileId: resources[0].id })).body

      let metaFolder = await getDefaultMetaFolder(space)
      if (!metaFolder) {
        metaFolder = await createDefaultMetaFolder(space, metaFolder.id)
      }

      await webdav.putFileContents(space, {
        fileId: metaFolder.id,
        fileName: 'readme.md',
        content: fileContent
      })
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
      spacesStore.updateSpaceField({
        id: space.id,
        field: 'spaceReadmeData',
        value: buildSpace(updatedDriveData).spaceReadmeData
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
