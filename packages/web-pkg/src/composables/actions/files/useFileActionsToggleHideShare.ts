import { triggerShareAction } from '../../../helpers/share/triggerShareAction'

import PQueue from 'p-queue'
import { isLocationSharesActive } from '../../../router'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../../actions'
import {
  useMessages,
  useSpacesStore,
  useCapabilityStore,
  useConfigStore,
  useResourcesStore
} from '../../piniaStores'
import { ShareResource } from '@ownclouders/web-client/src/helpers'

export const useFileActionsToggleHideShare = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const capabilityStore = useCapabilityStore()
  const router = useRouter()
  const { $gettext } = useGettext()

  const clientService = useClientService()
  const loadingService = useLoadingService()
  const configStore = useConfigStore()
  const spacesStore = useSpacesStore()
  const { upsertResource, resetSelection } = useResourcesStore()

  const handler = async ({ resources }: FileActionOptions<ShareResource>) => {
    const errors = []
    const triggerPromises = []
    const triggerQueue = new PQueue({
      concurrency: configStore.options.concurrentRequests.resourceBatchActions
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
              hasResharing: capabilityStore.sharingResharing,
              hasShareJail: capabilityStore.spacesShareJail,
              client: clientService.owncloudSdk,
              spaces: spacesStore.spaces,
              fullShareOwnerPaths: configStore.options.routing.fullShareOwnerPaths
            })
            if (share) {
              upsertResource(share)
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
      resetSelection()
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

  const actions = computed((): FileAction<ShareResource>[] => [
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
