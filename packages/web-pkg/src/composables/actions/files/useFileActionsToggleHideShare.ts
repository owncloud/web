import { triggerShareAction } from '../../../helpers/share/triggerShareAction'

import { Store } from 'vuex'
import PQueue from 'p-queue'
import { isLocationSharesActive } from '../../../router'
import { useCapabilityFilesSharingResharing, useCapabilityShareJailEnabled } from '../../capability'
import { useClientService } from '../../clientService'
import { useConfigurationManager } from '../../configuration'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../../actions'
import { useMessages } from '../../piniaStores'

export const useFileActionsToggleHideShare = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { showMessage, showErrorMessage } = useMessages()
  const router = useRouter()
  const { $gettext } = useGettext()

  const hasResharing = useCapabilityFilesSharingResharing()
  const hasShareJail = useCapabilityShareJailEnabled()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const configurationManager = useConfigurationManager()

  const handler = async ({ resources }: FileActionOptions) => {
    const errors = []
    const triggerPromises = []
    const triggerQueue = new PQueue({
      concurrency: configurationManager.options.concurrentRequests.resourceBatchActions
    })
    const hidden = !resources[0].hidden

    resources.forEach((resource) => {
      triggerPromises.push(
        triggerQueue.add(async () => {
          try {
            const share = await triggerShareAction({
              resource,
              status: resource.status,
              hidden,
              hasResharing: unref(hasResharing),
              hasShareJail: unref(hasShareJail),
              client: clientService.owncloudSdk,
              spaces: store.getters['runtime/spaces/spaces'],
              fullShareOwnerPaths: configurationManager.options.routing.fullShareOwnerPaths
            })
            if (share) {
              store.commit('Files/UPDATE_RESOURCE', share)
            }
          } catch (error) {
            console.error(error)
            errors.push(error)
          }
        })
      )
    })

    await Promise.all(triggerPromises)

    if (errors.length === 0) {
      store.dispatch('Files/resetFileSelection')
      showMessage({
        title: hidden
          ? $gettext('The share was hidden successfully')
          : $gettext('The share was unhidden successfully')
      })

      return
    }

    showErrorMessage({
      title: hidden
        ? $gettext('Failed to hide the share')
        : $gettext('Failed to unhide share share'),
      errors
    })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'toggle-hide-share',
      icon: 'eye-off', // FIXME: change icon based on hidden status
      handler: (args) => loadingService.addTask(() => handler(args)),
      label: ({ resources }) => (resources[0].hidden ? $gettext('Unhide') : $gettext('Hide')),
      isEnabled: ({ resources }) => {
        if (resources.length === 0) {
          return false
        }

        return isLocationSharesActive(router, 'files-shares-with-me')
      },
      componentType: 'button',
      class: 'oc-files-actions-hide-share-trigger'
    }
  ])

  return {
    actions
  }
}
