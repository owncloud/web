import { isLocationTrashActive } from '../../../router'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { computed, unref } from 'vue'
import { useRouter } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { useIsFilesAppActive } from 'web-pkg'
import { FileAction } from 'web-pkg/src/composables/actions'

export const useFileActionsShowActions = () => {
  const router = useRouter()
  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()

  const handler = () => {
    // we don't have details in the trashbin, yet. the actions panel is the default
    // panel at the moment, so we need to use `null` as panel name for trashbins.
    // unconditionally return hardcoded `actions` once we have a dedicated
    // details panel in trashbins.
    const panelName = isLocationTrashActive(router, 'files-trash-generic') ? null : 'actions'
    eventBus.publish(SideBarEventTopics.openWithPanel, panelName)
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'show-actions',
      icon: 'slideshow-3',
      label: () => $gettext('All Actions'),
      handler,
      isEnabled: ({ resources }) => {
        // sidebar is currently only available inside files app
        if (!unref(isFilesAppActive)) {
          return false
        }

        // we don't have batch actions in the right sidebar, yet.
        // return hardcoded `true` in all cases once we have them.
        return resources.length === 1
      },
      componentType: 'button',
      class: 'oc-files-actions-show-actions-trigger'
    }
  ])

  return {
    actions
  }
}
