import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../../actions'
import { CreateLinkModal } from '../../../components'
import { useAbility } from '../../ability'
import { LinkShare, isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import { useLinkTypes } from '../../links'
import { useLoadingService } from '../../loadingService'
import {
  useMessages,
  useModals,
  useUserStore,
  useCapabilityStore,
  useSharesStore
} from '../../piniaStores'
import { useClipboard } from '../../clipboard'
import { useClientService } from '../../clientService'
import { SharingLinkType } from '@ownclouders/web-client/src/generated'

export const useFileActionsCreateLink = ({
  enforceModal = false,
  showMessages = true,
  onLinkCreatedCallback = undefined
}: {
  enforceModal?: boolean
  showMessages?: boolean
  onLinkCreatedCallback?: (result: PromiseSettledResult<LinkShare>[]) => Promise<void> | void
} = {}) => {
  const clientService = useClientService()
  const userStore = useUserStore()
  const { showMessage, showErrorMessage } = useMessages()
  const { $gettext, $ngettext } = useGettext()
  const capabilityStore = useCapabilityStore()
  const ability = useAbility()
  const loadingService = useLoadingService()
  const { defaultLinkType } = useLinkTypes()
  const { addLink } = useSharesStore()
  const { dispatchModal } = useModals()
  const { copyToClipboard } = useClipboard()

  const proceedResult = async (result: PromiseSettledResult<LinkShare>[]) => {
    const succeeded = result.filter(
      (val): val is PromiseFulfilledResult<LinkShare> => val.status === 'fulfilled'
    )

    if (succeeded.length) {
      let successMessage = $gettext('Link has been created successfully')

      if (result.length === 1) {
        // Only copy to clipboard if the user tries to create one single link
        try {
          await copyToClipboard(succeeded[0].value.url)
          successMessage = $gettext('The link has been copied to your clipboard.')
        } catch (e) {
          console.warn('Unable to copy link to clipboard', e)
        }
      }

      if (showMessages) {
        showMessage({
          title: $ngettext(
            successMessage,
            'Links have been created successfully.',
            succeeded.length
          )
        })
      }
    }

    const failed = result.filter(({ status }) => status === 'rejected')
    if (failed.length) {
      showErrorMessage({
        errors: (failed as PromiseRejectedResult[]).map(({ reason }) => reason),
        title: $ngettext('Failed to create link', 'Failed to create links', failed.length)
      })
    }

    if (onLinkCreatedCallback) {
      onLinkCreatedCallback(result)
    }
  }

  const handler = async (
    { space, resources }: FileActionOptions,
    { isQuickLink = false }: { isQuickLink?: boolean } = {}
  ) => {
    const passwordEnforced = capabilityStore.sharingPublicPasswordEnforcedFor.read_only === true
    if (enforceModal || (passwordEnforced && unref(defaultLinkType) !== SharingLinkType.Internal)) {
      dispatchModal({
        title: $ngettext(
          'Create link for "%{resourceName}"',
          'Create links for the selected items',
          resources.length,
          { resourceName: resources[0].name }
        ),
        customComponent: CreateLinkModal,
        customComponentAttrs: () => ({
          space,
          resources,
          isQuickLink,
          callbackFn: proceedResult
        }),
        hideActions: true
      })
      return
    }

    const promises = resources.map((resource) =>
      addLink({
        clientService,
        space,
        resource,
        options: {
          '@libre.graph.quickLink': isQuickLink,
          displayName: $gettext('Link'),
          type: unref(defaultLinkType)
        }
      })
    )
    const result = await loadingService.addTask(() => Promise.allSettled<LinkShare>(promises))

    proceedResult(result)
  }

  const isVisible = ({ resources }: FileActionOptions) => {
    if (!resources.length) {
      return false
    }

    for (const resource of resources) {
      if (!resource.canShare({ user: userStore.user, ability })) {
        return false
      }

      if (isProjectSpaceResource(resource) && resource.disabled) {
        return false
      }
    }

    return true
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-links',
        icon: 'link',
        handler: (...args) => handler(...args, { isQuickLink: false }),
        label: () => {
          return $gettext('Create links')
        },
        isVisible,
        componentType: 'button',
        class: 'oc-files-actions-create-links'
      },
      {
        name: 'create-quick-links',
        icon: 'link',
        handler: (...args) => handler(...args, { isQuickLink: true }),
        label: () => {
          return $gettext('Create links')
        },
        isVisible,
        componentType: 'button',
        class: 'oc-files-actions-create-quick-links'
      }
    ]
  })

  return {
    actions
  }
}
