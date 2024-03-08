import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../../actions'
import { CreateLinkModal } from '../../../components'
import { useAbility } from '../../ability'
import {
  Share,
  SharePermissionBit,
  isProjectSpaceResource
} from '@ownclouders/web-client/src/helpers'
import { useCapabilityFilesSharingPublicPasswordEnforcedFor } from '../../capability'
import { useCreateLink, useDefaultLinkPermissions } from '../../links'
import { useLoadingService } from '../../loadingService'
import { useClipboard } from '../../clipboard'

export const useFileActionsCreateLink = ({
  store,
  enforceModal = false,
  showMessages = true,
  onLinkCreatedCallback = undefined
}: {
  store?: Store<any>
  enforceModal?: boolean
  showMessages?: boolean
  onLinkCreatedCallback?: (result: PromiseSettledResult<Share>[]) => Promise<void> | void
} = {}) => {
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()
  const loadingService = useLoadingService()
  const passwordEnforcedCapabilities = useCapabilityFilesSharingPublicPasswordEnforcedFor()
  const { defaultLinkPermissions } = useDefaultLinkPermissions()
  const { createLink } = useCreateLink()
  const { copyToClipboard } = useClipboard()

  const proceedResult = async (result: PromiseSettledResult<Share>[]) => {
    const succeeded = result.filter(
      (val): val is PromiseFulfilledResult<Share> => val.status === 'fulfilled'
    )

    if (succeeded.length) {
      let successMessage = $gettext('Link has been created successfully')

      if (result.length === 1) {
        // Only copy to clipboard if the user tries to create one single link
        successMessage = $gettext('The link has been copied to your clipboard.')
        await copyToClipboard(succeeded[0].value.url)
      }

      if (showMessages) {
        store.dispatch('showMessage', {
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
      store.dispatch('showErrorMessage', {
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
    const passwordEnforced = unref(passwordEnforcedCapabilities).read_only === true
    if (
      enforceModal ||
      (passwordEnforced && unref(defaultLinkPermissions) > SharePermissionBit.Internal)
    ) {
      return store.dispatch('createModal', {
        variation: 'passive',
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
    }

    const promises = resources.map((resource) =>
      createLink({ space, resource, quicklink: isQuickLink })
    )
    const result = await loadingService.addTask(() => Promise.allSettled<Share>(promises))

    proceedResult(result)
  }

  const isEnabled = ({ resources }: FileActionOptions) => {
    if (!resources.length) {
      return false
    }

    for (const resource of resources) {
      if (!resource.canShare({ user: store.getters.user, ability })) {
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
        isEnabled,
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
        isEnabled,
        componentType: 'button',
        class: 'oc-files-actions-create-quick-links'
      }
    ]
  })

  return {
    actions
  }
}
