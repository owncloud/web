import { isLocationTrashActive } from '../../../router'
import { ShareResource, isIncomingShareResource } from '@ownclouders/web-client'
import { eventBus } from '../../../services'
import { SideBarEventTopics } from '../../sideBar'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useIsFilesAppActive } from '../helpers'
import { useRouter } from '../../router'
import { FileAction, FileActionOptions } from '../types'
import { useCanShare } from '../../shares'
import { useResourcesStore } from '../../piniaStores'

export const useFileActionsShowShares = () => {
  const router = useRouter()
  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()
  const { canShare } = useCanShare()
  const resourcesStore = useResourcesStore()

  const handler = ({ resources }: FileActionOptions) => {
    resourcesStore.setSelection(resources.map(({ id }) => id))
    eventBus.publish(SideBarEventTopics.openWithPanel, 'sharing#peopleShares')
  }

  const actions = computed((): FileAction<ShareResource>[] => [
    {
      name: 'show-shares',
      icon: 'user-add',
      label: () => $gettext('Share'),
      handler,
      isVisible: ({ space, resources }) => {
        // sidebar is currently only available inside files app
        if (!unref(isFilesAppActive)) {
          return false
        }

        if (isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (resources.length !== 1) {
          return false
        }
        if (isIncomingShareResource(resources[0]) && !resources[0].syncEnabled) {
          return false
        }
        return canShare({ space, resource: resources[0] })
      },
      componentType: 'button',
      class: 'oc-files-actions-show-shares-trigger'
    }
  ])

  return {
    actions
  }
}
