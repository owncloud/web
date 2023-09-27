import { triggerShareAction } from '../../../helpers/share/triggerShareAction'

import { Store } from 'vuex'
import PQueue from 'p-queue'
import { ShareStatus } from 'web-client/src/helpers/share'
import { isLocationSharesActive, isLocationSpacesActive } from '../../../router'
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
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions/types'

// TODO: Replace all "accept" copy leftovers
export const useFileActionsHideShare = ({ store }: { store?: Store<any> } = {}) => {
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
            const share = await triggerShareAction({
              resource,
              status: ShareStatus.pending,
              // visibility: 'public',
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
    console.log(errors)
    if (errors.length === 0) {
      store.dispatch('Files/resetFileSelection')

      if (isLocationSpacesActive(router, 'files-spaces-generic')) {
        store.dispatch('showMessage', {
          title: $ngettext(
            'The selected share was accepted successfully',
            'The selected shares were accepted successfully',
            resources.length
          )
        })
      }

      return
    }

    store.dispatch('showErrorMessage', {
      title: $ngettext(
        'Failed to accept the selected share.',
        'Failed to accept selected shares.',
        resources.length
      ),
      errors
    })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'hide-share',
      icon: 'check',
      handler: (args) => loadingService.addTask(() => handler(args)),
      label: ({ resources }) => $ngettext('Accept share', 'Accept shares', resources.length),
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

        return true
        // const acceptDisabled = resources.some((resource) => {
        //   return resource.status === ShareStatus.accepted
        // })
        // return !acceptDisabled
      },
      componentType: 'button',
      class: 'oc-files-actions-hide-share-trigger'
    }
  ])

  return {
    actions
  }
}
