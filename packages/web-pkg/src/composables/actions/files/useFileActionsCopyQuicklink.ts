import {
  Share,
  ShareStatus,
  ShareTypes,
  buildShare
} from '@ownclouders/web-client/src/helpers/share'
import { isLocationSharesActive } from '../../../router'
import { computed, unref } from 'vue'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { useGettext } from 'vue3-gettext'
import { Store } from 'vuex'
import { FileAction, FileActionOptions } from '../types'
import { useCanShare } from '../../shares'
import { useClipboard } from '../../clipboard'
import { Resource } from '@ownclouders/web-client'
import { useFileActionsCreateLink } from './useFileActionsCreateLink'

export const useFileActionsCopyQuickLink = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
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
    store,
    onLinkCreatedCallback,
    showMessages: false
  })
  const createQuicklinkAction = computed<FileAction>(() =>
    unref(createLinkActions).find(({ name }) => name === 'create-quick-links')
  )

  const copyQuickLinkToClipboard = async (url: string) => {
    try {
      await copyToClipboard(url)
      return store.dispatch('showMessage', {
        title: $gettext('The link has been copied to your clipboard.')
      })
    } catch (e) {
      console.error(e)
      return store.dispatch('showErrorMessage', {
        title: $gettext('Copy link failed'),
        error: e
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
      isEnabled: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }
        if (isLocationSharesActive(router, 'files-shares-with-me')) {
          if (resources[0].status !== ShareStatus.accepted) {
            return false
          }
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
