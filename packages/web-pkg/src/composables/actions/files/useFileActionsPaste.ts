import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../../router'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useGetMatchingSpace } from '../../spaces'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { FileAction, FileActionOptions } from '../types'
import { Resource, SpaceResource, isShareSpaceResource } from '@ownclouders/web-client'
import { useClipboardStore, useResourcesStore } from '../../piniaStores'
import { ClipboardActions, ResourceTransfer, TransferType } from '../../../helpers'
import { storeToRefs } from 'pinia'
import { usePasteWorker } from '../../webWorkers/pasteWorker'

export const useFileActionsPaste = () => {
  const router = useRouter()
  const clientService = useClientService()
  const { getMatchingSpace } = useGetMatchingSpace()
  const { $gettext, $ngettext } = useGettext()
  const clipboardStore = useClipboardStore()
  const { startWorker } = usePasteWorker()

  const resourcesStore = useResourcesStore()
  const { currentFolder } = storeToRefs(resourcesStore)

  const isMacOs = computed(() => {
    return window.navigator.platform.match('Mac')
  })

  const pasteShortcutString = computed(() => {
    if (unref(isMacOs)) {
      return $gettext('⌘ + V')
    }
    return $gettext('Ctrl + V')
  })

  const transferType = computed(() => {
    if (clipboardStore.action === ClipboardActions.Cut) {
      return TransferType.MOVE
    }

    return TransferType.COPY
  })

  const pasteSelectedFiles = async ({
    targetSpace,
    sourceSpace,
    resources
  }: {
    targetSpace: SpaceResource
    sourceSpace: SpaceResource
    resources: Resource[]
  }) => {
    const resourceTransfer = new ResourceTransfer(
      sourceSpace,
      resources,
      targetSpace,
      unref(currentFolder),
      currentFolder,
      clientService,
      $gettext,
      $ngettext
    )

    const transferData = await resourceTransfer.getTransferData(unref(transferType))
    if (!transferData.length) {
      return
    }

    const originalCurrentFolderId = unref(currentFolder)?.id

    startWorker(transferData, async ({ successful, failed }) => {
      resourceTransfer.showResultMessage(failed, successful, unref(transferType))

      if (!successful.length) {
        return
      }

      // user has navigated to another location meanwhile -> no need to update store
      if (unref(currentFolder) && originalCurrentFolderId !== unref(currentFolder).id) {
        return
      }

      // handle store update, fetch resources first
      const loadingResources: Promise<void>[] = []
      const fetchedResources: Resource[] = []

      for (const resource of successful) {
        loadingResources.push(
          (async () => {
            const movedResource = await clientService.webdav.getFileInfo(targetSpace, resource)
            fetchedResources.push(movedResource)
          })()
        )
      }

      await Promise.allSettled(loadingResources)

      // FIXME: move to buildResource as soon as it has space context
      if (isShareSpaceResource(targetSpace)) {
        fetchedResources.forEach((r) => {
          r.remoteItemId = targetSpace.id
        })
      }

      resourcesStore.upsertResources(fetchedResources)
      resourcesStore.loadIndicators(targetSpace, unref(currentFolder).id)
    })
  }

  const handler = async ({ space: targetSpace }: FileActionOptions) => {
    const resourceSpaceMapping = clipboardStore.resources.reduce<
      Record<string, { space: SpaceResource; resources: Resource[] }>
    >((acc, resource) => {
      if (resource.storageId in acc) {
        acc[resource.storageId].resources.push(resource)
        return acc
      }

      const matchingSpace = getMatchingSpace(resource)

      if (!(matchingSpace.id in acc)) {
        acc[matchingSpace.id] = { space: matchingSpace, resources: [] }
      }

      acc[matchingSpace.id].resources.push(resource)
      return acc
    }, {})

    const promises = Object.values(resourceSpaceMapping).map(
      ({ space: sourceSpace, resources: resourcesToCopy }) => {
        return pasteSelectedFiles({ targetSpace, sourceSpace, resources: resourcesToCopy })
      }
    )
    await Promise.all(promises)
    clipboardStore.clearClipboard()
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'paste',
      icon: 'clipboard',
      handler,
      label: () => $gettext('Paste'),
      shortcut: unref(pasteShortcutString),
      isVisible: ({ resources }) => {
        if (clipboardStore.resources.length === 0) {
          return false
        }
        if (
          !isLocationSpacesActive(router, 'files-spaces-generic') &&
          !isLocationPublicActive(router, 'files-public-link') &&
          !isLocationCommonActive(router, 'files-common-favorites')
        ) {
          return false
        }
        if (resources.length === 0) {
          return false
        }

        if (isLocationPublicActive(router, 'files-public-link') && unref(currentFolder)) {
          return unref(currentFolder)?.canCreate()
        }

        // copy can't be restricted in authenticated context, because
        // a user always has their home dir with write access
        return true
      },
      componentType: 'button',
      class: 'oc-files-actions-copy-trigger'
    }
  ])

  return {
    actions
  }
}
