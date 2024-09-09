import { isLinkShare, ShareTypes } from '@ownclouders/web-client'
import { computed, unref } from 'vue'
import { useClientService } from '../../clientService'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../types'
import { useCanShare } from '../../shares'
import { useClipboard } from '../../clipboard'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useFileActionsCreateLink } from './useFileActionsCreateLink'
import { useMessages, useSharesStore } from '../../piniaStores'
import { useAbility } from '../../ability'
import { SideBarEventTopics } from '../../sideBar'
import { useEventBus } from '../../eventBus'

export const useFileActionsCopyQuickLink = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const language = useGettext()
  const { $gettext } = language
  const clientService = useClientService()
  const { canShare } = useCanShare()
  const sharesStore = useSharesStore()
  const { copyToClipboard } = useClipboard()
  const { can } = useAbility()
  const eventBus = useEventBus()

  const { actions: createLinkActions } = useFileActionsCreateLink()
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
    const { shares } = await client.listPermissions(space.id, resource.id, sharesStore.graphRoles)
    return shares.filter(isLinkShare).find(({ isQuickLink }) => isQuickLink)
  }

  const handler = async ({ space, resources }: FileActionOptions) => {
    const [resource] = resources

    const existingQuickLink = await getExistingQuickLink({ space, resource })
    if (existingQuickLink) {
      return copyQuickLinkToClipboard(existingQuickLink.webUrl)
    }

    if (!can('create-all', 'PublicLink')) {
      // this is for handling an edge case where the user cannot create public links
      // and no quick links exists, but a normal one does
      eventBus.publish(SideBarEventTopics.openWithPanel, 'sharing')
      return
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

        if (
          !can('create-all', 'PublicLink') &&
          !resources[0].shareTypes.includes(ShareTypes.link.value)
        ) {
          return false
        }

        return canShare({ space, resource: resources[0] })
      },
      class: 'oc-files-actions-copy-quicklink-trigger'
    }
  ])

  return {
    actions
  }
}
