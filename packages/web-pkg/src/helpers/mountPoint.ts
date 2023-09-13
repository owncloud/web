import { Store } from 'vuex'
import { Resource } from 'web-client/src'
import { MountPointSpaceResource, isMountPointSpaceResource } from 'web-client/src/helpers'
import { urlJoin } from 'web-client/src/utils'

const findMatchingMountPoint = (
  store: Store<unknown>,
  id: Resource['id']
): MountPointSpaceResource => {
  return store.getters['runtime/spaces/spaces'].find(
    (space) => isMountPointSpaceResource(space) && space.root?.remoteItem?.id === id
  )
}

export const findPathToMountPoint = (
  store: Store<unknown>,
  fileId: Resource['id']
): { mountPoint: MountPointSpaceResource; resourcePath: string } => {
  let mountPoint = findMatchingMountPoint(store, fileId)
  let resource = store.getters['runtime/ancestorMetaData/ancestorMetaData'][fileId]
  const sharePathSegments = mountPoint ? [] : [resource.name]
  while (!mountPoint) {
    resource = store.getters['runtime/ancestorMetaData/ancestorMetaData'][resource.parentFolderId]
    mountPoint = findMatchingMountPoint(store, resource.id)
    if (!mountPoint) {
      sharePathSegments.unshift(resource.name)
    }
  }
  return {
    mountPoint,
    resourcePath: urlJoin(mountPoint.root.remoteItem.path, ...sharePathSegments)
  }
}
