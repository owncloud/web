import { SpaceAction, SpaceActionOptions } from '../types'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

import { useOpenWithDefaultApp } from '../useOpenWithDefaultApp'
import { getRelativeSpecialFolderSpacePath } from '@ownclouders/web-client'
import { useClientService } from '../../clientService'
import { useSpacesStore, useUserStore } from '../../piniaStores'
import { useCreateSpace } from '../../spaces'

export const useSpaceActionsEditReadmeContent = () => {
  const clientService = useClientService()
  const { openWithDefaultApp } = useOpenWithDefaultApp()
  const { createDefaultMetaFolder } = useCreateSpace()
  const userStore = useUserStore()
  const spacesStore = useSpacesStore()
  const { $gettext } = useGettext()

  const handler = async ({ resources }: SpaceActionOptions) => {
    let markdownResource = null
    try {
      await clientService.webdav.getFileInfo(resources[0], { path: '.space' })
    } catch (_) {
      await createDefaultMetaFolder(resources[0])
      markdownResource = await clientService.webdav.putFileContents(resources[0], {
        path: '.space/readme.md'
      })

      const updatedSpace = await clientService.graphAuthenticated.drives.updateDrive(
        resources[0].id,
        {
          name: resources[0].name,
          special: [{ specialFolder: { name: 'readme' }, id: markdownResource.id }]
        }
      )

      spacesStore.updateSpaceField({
        id: resources[0].id,
        field: 'spaceReadmeData',
        value: updatedSpace.spaceReadmeData
      })
    }

    if (!markdownResource) {
      markdownResource = await clientService.webdav.getFileInfo(resources[0], {
        path: getRelativeSpecialFolderSpacePath(resources[0], 'readme')
      })
    }

    openWithDefaultApp({ space: resources[0], resource: markdownResource })
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'editReadmeContent',
      icon: 'article',
      label: () => {
        return $gettext('Edit description')
      },
      handler,
      isVisible: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }

        return resources[0].canEditReadme({ user: userStore.user })
      },
      componentType: 'button',
      class: 'oc-files-actions-edit-readme-content-trigger'
    }
  ])

  return {
    actions
  }
}
