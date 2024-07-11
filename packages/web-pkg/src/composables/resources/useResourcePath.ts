import { Ref, unref } from 'vue'
import { useResourcesStore } from '../piniaStores'
import { useRouteQuery, useRouter } from '../router'
import {
  isOutgoingShareResource,
  isProjectSpaceResource,
  isPublicSpaceResource,
  isSearchResultResource,
  isTrashResource,
  Resource,
  SpaceResource,
  urlJoin
} from '@ownclouders/web-client'
import { Router } from 'vue-router'

/**
 * When listing resources via the WebDAV API by only providing an ID,
 * path information is missing in the server response. This helper provides
 * a method to still retrieve the full resource path.
 */
export const useResourcePath = ({ router }: { router?: Router } = {}) => {
  router = router || useRouter()
  const resourcesStore = useResourcesStore()

  // vue-router doesn't have types for query objects
  const contextRouteParams = useRouteQuery('contextRouteParams', '', router) as unknown as Ref<{
    driveAliasAndItem: string
  }>

  // some endpoints/APIs provide full resource paths already
  const resourceAlreadyHasFullPath = (space: SpaceResource, resource: Resource) => {
    // trashed resources have full path info because of the dav trash-bin endpoint
    if (isTrashResource(resource)) {
      return true
    }

    // search result resources have full path info because of the dav report endpoint
    if (isSearchResultResource(resource)) {
      return true
    }

    // outgoing shares have full path info because of the graph API
    if (isOutgoingShareResource(resource)) {
      return true
    }

    // spaces always have "/" as path
    const isSpaceRoot = resource.parentFolderId === resource.storageId
    if (isProjectSpaceResource(resource) || isSpaceRoot) {
      return true
    }

    // public spaces don't support id-based requests, hence we have full path info
    if (isPublicSpaceResource(space)) {
      return true
    }

    return false
  }

  const getResourcePath = (space: SpaceResource, resource: Resource) => {
    if (resourceAlreadyHasFullPath(space, resource)) {
      return resource.path
    }

    // use driveAliasAndItem to retrieve full path when in app context
    const driveAliasAndItem = unref(contextRouteParams).driveAliasAndItem
    if (driveAliasAndItem?.startsWith(space.driveAlias)) {
      const path = driveAliasAndItem.slice(space.driveAlias.length)
      return urlJoin(path, resource.name, { leadingSlash: true })
    }

    // use ancestor data to retrieve the full path in generic spaces
    const ancestor = Object.values(resourcesStore.ancestorMetaData).find(
      ({ id }) => id === resource.parentFolderId
    )

    const path = ancestor?.path || ''
    // console.log('path', urlJoin(path, resource.name, { leadingSlash: true }))
    return urlJoin(path, resource.name, { leadingSlash: true })
  }

  return {
    getResourcePath
  }
}
