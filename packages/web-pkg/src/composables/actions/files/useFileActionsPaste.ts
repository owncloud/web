import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../../router'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useGetMatchingSpace } from '../../spaces'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { FileAction, FileActionOptions } from '../types'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useClipboardStore, useResourcesStore } from '../../piniaStores'
import { ClipboardActions, ResourceTransfer, TransferType } from '../../../helpers'
import { storeToRefs } from 'pinia'

export const useFileActionsPaste = () => {
  const router = useRouter()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const { getMatchingSpace } = useGetMatchingSpace()
  const { $gettext, $ngettext } = useGettext()
  const clipboardStore = useClipboardStore()

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

  const pasteSelectedFiles = ({
    targetSpace,
    sourceSpace,
    resources
  }: {
    targetSpace: SpaceResource
    sourceSpace: SpaceResource
    resources: Resource[]
  }) => {
    const copyMove = new ResourceTransfer(
      sourceSpace,
      resources,
      targetSpace,
      unref(currentFolder),
      clientService,
      loadingService,
      $gettext,
      $ngettext
    )
    let movedResourcesPromise: Promise<Resource[]>
    if (clipboardStore.action === ClipboardActions.Cut) {
      movedResourcesPromise = copyMove.perform(TransferType.MOVE)
    }
    if (clipboardStore.action === ClipboardActions.Copy) {
      movedResourcesPromise = copyMove.perform(TransferType.COPY)
    }
    return movedResourcesPromise.then((movedResources) => {
      const loadingResources = []
      const fetchedResources: Resource[] = []
      for (const resource of movedResources) {
        loadingResources.push(
          (async () => {
            const movedResource = await clientService.webdav.getFileInfo(targetSpace, resource)
            fetchedResources.push(movedResource)
          })()
        )
      }

      return Promise.all(loadingResources).then(() => {
        resourcesStore.upsertResources(fetchedResources)
        resourcesStore.loadIndicators(unref(currentFolder).path)
      })
    })
  }

  const handler = async ({ space: targetSpace }: FileActionOptions) => {
    const resourceSpaceMapping: Record<string, { space: SpaceResource; resources: Resource[] }> =
      clipboardStore.resources.reduce((acc, resource) => {
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
      isEnabled: ({ resources }) => {
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
          return unref(currentFolder).canCreate()
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
