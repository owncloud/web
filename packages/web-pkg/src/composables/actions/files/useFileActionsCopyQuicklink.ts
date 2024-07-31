import { isLinkShare } from '@ownclouders/web-client'
import { computed, unref } from 'vue'
import { useClientService } from '../../clientService'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../types'
import { useCanShare } from '../../shares'
import { useClipboard } from '../../clipboard'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useFileActionsCreateLink } from './useFileActionsCreateLink'
import { useMessages } from '../../piniaStores'

export const useFileActionsCopyQuickLink = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const language = useGettext()
  const { $gettext } = language
  const clientService = useClientService()
  const { canShare } = useCanShare()
  const { copyToClipboard } = useClipboard()

  const { actions: createLinkActions } = useFileActionsCreateLink({
    showMessages: false
  })
  const createQuicklinkAction = computed<FileAction>(() =>
    unref(createLinkActions).find(({ name }) => name === 'create-quick-links')
  )

  const copyQuickLinkToClipboard = async (url: string) => {
    try {
      await copyToClipboard(url)
      showMessage({ title: $gettext('The link has been copied to your clipboard.') })
    } catch (e) {
      console.error(e)
      showErrorMessage({
        title: $gettext('Copy link failed'),
        errors: [e]
      })
    }
  }

  const getExistingQuickLink = async ({
    space,
    resource
  }: {
    space: SpaceResource
    resource: Resource
  }) => {
    const client = clientService.graphAuthenticated.permissions
    const { shares } = await client.listPermissions(space.id, resource.id)
    return shares.filter(isLinkShare).find(({ isQuickLink }) => isQuickLink)
  }

  const handler = async ({ space, resources }: FileActionOptions) => {
    const [resource] = resources

    const existingQuickLink = await getExistingQuickLink({ space, resource })
    if (existingQuickLink) {
      return copyQuickLinkToClipboard(existingQuickLink.webUrl)
    }

    return unref(createQuicklinkAction).handler({ space, resources })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'copy-quicklink',
      icon: 'link',
      label: () => $gettext('Copy link'),
      handler,
      isVisible: ({ space, resources }) => {
        if (resources.length !== 1) {
          return false
        }

        return canShare({ space, resource: resources[0] })
      },
      componentType: 'button',
      class: 'oc-files-actions-copy-quicklink-trigger'
    }
  ])

  return {
    actions
  }
}
