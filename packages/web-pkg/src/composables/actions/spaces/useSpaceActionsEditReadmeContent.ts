import { SpaceAction, SpaceActionOptions } from '../types'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

import { useOpenWithDefaultApp } from '../useOpenWithDefaultApp'
import { getRelativeSpecialFolderSpacePath } from '@ownclouders/web-client/src/helpers'
import { useClientService } from '../../clientService'
import { useUserStore } from '../../piniaStores'

export const useSpaceActionsEditReadmeContent = () => {
  const clientService = useClientService()
  const { openWithDefaultApp } = useOpenWithDefaultApp()
  const userStore = useUserStore()
  const { $gettext } = useGettext()

  const handler = async ({ resources }: SpaceActionOptions) => {
    const markdownResource = await clientService.webdav.getFileInfo(resources[0], {
      path: getRelativeSpecialFolderSpacePath(resources[0], 'readme')
    })

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
      isEnabled: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }

        if (!resources[0].canEditReadme({ user: userStore.user })) {
          return false
        }

        return !!resources[0].spaceReadmeData
      },
      componentType: 'button',
      class: 'oc-files-actions-edit-readme-content-trigger'
    }
  ])

  return {
    actions
  }
}
