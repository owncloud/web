import { triggerShareAction } from '../../../helpers/share/triggerShareAction'

import { Store } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { isLocationSharesActive, isLocationSpacesActive } from '../../../router'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../../actions'
import { useMessages, useSpacesStore, useCapabilityStore, useConfigStore } from '../../piniaStores'

export const useFileActionsAcceptShare = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { showMessage, showErrorMessage } = useMessages()
  const capabilityStore = useCapabilityStore()
  const router = useRouter()
  const { $gettext, $ngettext } = useGettext()

  const clientService = useClientService()
  const loadingService = useLoadingService()
  const configStore = useConfigStore()
  const spacesStore = useSpacesStore()

  const handler = async ({ resources }: FileActionOptions) => {
    const errors = []
    const triggerPromises = []
    const triggerQueue = new PQueue({
      concurrency: configStore.options.concurrentRequests.resourceBatchActions
    })
    resources.forEach((resource) => {
      triggerPromises.push(
        triggerQueue.add(async () => {
          try {
            const share = await triggerShareAction({
              resource,
              status: ShareStatus.accepted,
              hasResharing: capabilityStore.sharingResharing,
              hasShareJail: capabilityStore.spacesShareJail,
              client: clientService.owncloudSdk,
              spaces: spacesStore.spaces,
              fullShareOwnerPaths: configStore.options.routing.fullShareOwnerPaths
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

      if (isLocationSpacesActive(router, 'files-spaces-generic')) {
        showMessage({
          title: $ngettext(
            'Sync for the selected share was enabled successfully',
            'Sync for the selected shares was enabled successfully',
            resources.length
          )
        })
      }

      return
    }

    showErrorMessage({
      title: $ngettext(
        'Failed to enable sync for the the selected share',
        'Failed to enable sync for the selected shares',
        resources.length
      ),
      errors
    })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'accept-share',
      icon: 'check',
      handler: (args) => loadingService.addTask(() => handler(args)),
      label: () => $gettext('Enable sync'),
      isEnabled: ({ space, resources }) => {
        if (
          !isLocationSharesActive(router, 'files-shares-with-me') &&
          !isLocationSpacesActive(router, 'files-spaces-generic')
        ) {
          return false
        }
        if (resources.length === 0) {
          return false
        }

        if (
          isLocationSpacesActive(router, 'files-spaces-generic') &&
          (unref(space)?.driveType !== 'share' || resources.length > 1 || resources[0].path !== '/')
        ) {
          return false
        }

        const acceptDisabled = resources.some((resource) => {
          return resource.status === ShareStatus.accepted
        })
        return !acceptDisabled
      },
      componentType: 'button',
      class: 'oc-files-actions-accept-share-trigger'
    }
  ])

  return {
    actions
  }
}
