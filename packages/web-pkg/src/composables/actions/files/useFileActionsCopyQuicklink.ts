import { LinkShare, isIncomingShareResource } from '@ownclouders/web-client/src/helpers/share'
import { computed, unref } from 'vue'
import { useClientService } from '../../clientService'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../types'
import { useCanShare } from '../../shares'
import { useClipboard } from '../../clipboard'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useFileActionsCreateLink } from './useFileActionsCreateLink'
import { useMessages, useUserStore } from '../../piniaStores'
import { Permission } from '@ownclouders/web-client/src/generated'
import { buildLinkShare } from '@ownclouders/web-client/src/helpers/share/functionsNG'
import { getGraphItemId } from '@ownclouders/web-client/src/helpers'

export const useFileActionsCopyQuickLink = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const language = useGettext()
  const { $gettext } = language
  const clientService = useClientService()
  const { canShare } = useCanShare()
  const { copyToClipboard } = useClipboard()
  const userStore = useUserStore()

  const onLinkCreatedCallback = async (result: PromiseSettledResult<LinkShare>[]) => {
    const link = result.find(
      (val): val is PromiseFulfilledResult<LinkShare> => val.status === 'fulfilled'
    )
    if (link?.value) {
      await copyQuickLinkToClipboard(link.value.webUrl)
    }
  }

  const { actions: createLinkActions } = useFileActionsCreateLink({
    onLinkCreatedCallback,
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
  }): Promise<LinkShare> => {
    const client = clientService.graphAuthenticated
    const { data } = await client.permissions.listPermissions(space.id, getGraphItemId(resource))

    const permissions = ((data as any).value || []) as Permission[]
    const graphPermission = permissions.find((p) => p.link?.['@libre.graph.quickLink'])
    return graphPermission
      ? buildLinkShare({ graphPermission, user: userStore.user, resourceId: resource.id })
      : null
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
        if (isIncomingShareResource(resources[0]) && !resources[0].syncEnabled) {
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
