import {
  Share,
  ShareTypes,
  buildShare,
  isIncomingShareResource
} from '@ownclouders/web-client/src/helpers/share'
import { computed, unref } from 'vue'
import { useClientService } from '../../clientService'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../types'
import { useCanShare } from '../../shares'
import { useClipboard } from '../../clipboard'
import { Resource } from '@ownclouders/web-client'
import { useFileActionsCreateLink } from './useFileActionsCreateLink'
import { useMessages } from '../../piniaStores'

export const useFileActionsCopyQuickLink = () => {
  const { showMessage, showErrorMessage } = useMessages()
  const language = useGettext()
  const { $gettext } = language
  const clientService = useClientService()
  const { canShare } = useCanShare()
  const { copyToClipboard } = useClipboard()

  const onLinkCreatedCallback = async (result: PromiseSettledResult<Share>[]) => {
    const link = result.find(
      (val): val is PromiseFulfilledResult<Share> => val.status === 'fulfilled'
    )
    if (link?.value) {
      await copyQuickLinkToClipboard(link.value.url)
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

  const getExistingQuickLink = async ({ fileId, path }: Resource): Promise<Share> => {
    const linkSharesForResource = await clientService.owncloudSdk.shares.getShares(path, {
      share_types: ShareTypes?.link?.value?.toString(),
      spaceRef: fileId,
      include_tags: false
    })

    return linkSharesForResource
      .map((share: any) => buildShare(share.shareInfo, null, null))
      .find((share: Share) => share.quicklink === true)
  }

  const handler = async ({ space, resources }: FileActionOptions) => {
    const [resource] = resources

    const existingQuickLink = await getExistingQuickLink(resource)
    if (existingQuickLink) {
      return copyQuickLinkToClipboard(existingQuickLink.url)
    }

    return unref(createQuicklinkAction).handler({ space, resources })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'copy-quicklink',
      icon: 'link',
      label: () => $gettext('Copy link'),
      handler,
      isVisible: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }
        if (isIncomingShareResource(resources[0]) && !resources[0].syncEnabled) {
          return false
        }

        return canShare(resources[0])
      },
      componentType: 'button',
      class: 'oc-files-actions-copy-quicklink-trigger'
    }
  ])

  return {
    actions
  }
}
