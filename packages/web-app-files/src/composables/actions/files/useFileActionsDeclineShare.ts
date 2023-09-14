import { triggerShareAction } from '../../../helpers/share/triggerShareAction'
import {
  isLocationSharesActive,
  isLocationSpacesActive,
  createLocationShares
} from '../../../router'
import { Store } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from 'web-client/src/helpers/share'
import {
  useCapabilityFilesSharingResharing,
  useCapabilityShareJailEnabled,
  useClientService,
  useConfigurationManager,
  useLoadingService,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'

export const useFileActionsDeclineShare = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $ngettext } = useGettext()

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
            const share = await triggerShareAction(
              resource,
              ShareStatus.declined,
              unref(hasResharing),
              unref(hasShareJail),
              clientService.owncloudSdk,
              configurationManager
            )
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
        store.dispatch('showMessage', {
          title: $ngettext(
            'The selected share was declined successfully',
            'The selected shares were declined successfully',
            resources.length
          )
        })
        router.push(createLocationShares('files-shares-with-me'))
      }

      return
    }

    store.dispatch('showErrorMessage', {
      title: $ngettext(
        'Failed to decline the selected share',
        'Failed to decline selected shares',
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
      label: ({ resources }) => $ngettext('Decline share', 'Decline shares', resources.length),
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
