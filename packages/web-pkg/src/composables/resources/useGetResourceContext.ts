import {
  Resource,
  SpaceResource,
  buildShareSpaceResource,
  isMountPointSpaceResource
} from '@ownclouders/web-client/src/helpers'
import { computed, unref } from 'vue'
import { useStore } from '../store'
import { useClientService } from '../clientService'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useConfigurationManager } from '../configuration'
import { useLoadFileInfoById } from './useLoadFileInfoById'
import { useCapabilitySpacesEnabled } from '../capability'
import { useGetMatchingSpace } from '../spaces/useGetMatchingSpace'

export const useGetResourceContext = () => {
  const store = useStore()
  const clientService = useClientService()
  const configurationManager = useConfigurationManager()
  const { loadFileInfoByIdTask } = useLoadFileInfoById({ clientService })
  const { getPersonalSpace } = useGetMatchingSpace()

  const hasSpaces = useCapabilitySpacesEnabled(store)
  const spaces = computed<SpaceResource[]>(() => store.getters['runtime/spaces/spaces'])

  const getMatchingSpaceByFileId = (id: Resource['id']) => {
    if (!unref(hasSpaces)) {
      return getPersonalSpace()
    }
    return unref(spaces).find((space) => id.toString().startsWith(space.id.toString()))
  }
  const getMatchingMountPoint = (id: Resource['id']) => {
    return unref(spaces).find(
      (space) => isMountPointSpaceResource(space) && space.root?.remoteItem?.id === id
    )
  }

  // get context for a resource when only having its id. be careful, this might be very expensive!
  const getResourceContext = async (id: string) => {
    let path: string
    let resource: Resource
    let space = getMatchingSpaceByFileId(id)

    if (space) {
      path = await clientService.webdav.getPathForFileId(id)
      resource = await clientService.webdav.getFileInfo(space, { path })
      return { space, resource, path }
    }

    // no matching space found => the file doesn't lie in own spaces => it's a share.
    // do PROPFINDs on parents until root of accepted share is found in `mountpoint` spaces
    await store.dispatch('runtime/spaces/loadMountPoints', {
      graphClient: clientService.graphAuthenticated
    })

    let mountPoint = getMatchingMountPoint(id)
    resource = await loadFileInfoByIdTask.perform(id)
    const sharePathSegments = mountPoint ? [] : [unref(resource).name]
    let tmpResource = unref(resource)

    while (!mountPoint) {
      tmpResource = await loadFileInfoByIdTask.perform(tmpResource.parentFolderId)
      mountPoint = getMatchingMountPoint(tmpResource.id)
      if (!mountPoint) {
        sharePathSegments.unshift(tmpResource.name)
      }
    }

    space = buildShareSpaceResource({
      shareId: mountPoint.nodeId,
      shareName: mountPoint.name,
      serverUrl: configurationManager.serverUrl
    })

    path = urlJoin(...sharePathSegments)
    return { space, resource, path }
  }

  return {
    getResourceContext
  }
}
