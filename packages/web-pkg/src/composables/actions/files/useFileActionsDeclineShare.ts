import { triggerShareAction } from '../../../helpers/share/triggerShareAction'
import {
  isLocationSharesActive,
  isLocationSpacesActive,
  createLocationShares
} from '../../../router'
import { Store } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { useCapabilityFilesSharingResharing, useCapabilityShareJailEnabled } from '../../capability'
import { useClientService } from '../../clientService'
import { useConfigurationManager } from '../../configuration'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../types'

export const useFileActionsDeclineShare = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext, $ngettext } = useGettext()

  const hasResharing = useCapabilityFilesSharingResharing()
  const hasShareJail = useCapabilityShareJailEnabled()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const configurationManager = useConfigurationManager()

  const handler = async ({ resources }: FileActionOptions) => {
    const errors = []
    const triggerPromises = []
    const triggerQueue = new PQueue({ concurrency: 4 })
    resources.forEach((resource) => {
      triggerPromises.push(
        triggerQueue.add(async () => {
          try {
            const share = await triggerShareAction({
              resource,
              status: ShareStatus.declined,
              // TODO: Hidden implications here?
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
      if (isLocationSpacesActive(router, 'files-spaces-generic')) {
        store.dispatch('showMessage', {
          title: $ngettext(
            'Sync for the selected share was disabled successfully',
            'Sync for the selected shares was disabled successfully',
            resources.length
          )
        })
        router.push(createLocationShares('files-shares-with-me'))
      }

      return
    }

    store.dispatch('showErrorMessage', {
      title: $ngettext(
        'Failed to disable sync for the the selected share',
        'Failed to disable sync for the selected shares',
        resources.length
      ),
      errors
    })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'decline-share',
      icon: 'spam-3',
      handler: (args) => loadingService.addTask(() => handler(args)),
      label: () => $gettext('Disable sync'),
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
          (space?.driveType !== 'share' || resources.length > 1 || resources[0].path !== '/')
        ) {
          return false
        }

        const declineDisabled = resources.some((resource) => {
          return resource.status === ShareStatus.declined
        })
        return !declineDisabled
      },
      componentType: 'button',
      class: 'oc-files-actions-decline-share-trigger'
    }
  ])

  return {
    actions
  }
}
