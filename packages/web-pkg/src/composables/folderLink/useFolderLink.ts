import { Resource } from '@ownclouders/web-client'
import {
  extractParentFolderName,
  isProjectSpaceResource,
  isShareRoot,
  isShareSpaceResource
} from '@ownclouders/web-client/src/helpers'
import { useGettext } from 'vue3-gettext'
import { unref } from 'vue'
import { computed } from 'vue/dist/vue'
import { useCapabilityShareJailEnabled } from '../capability'
import { useGetMatchingSpace } from '../spaces'

export const useFolderLink = () => {
  const { $gettext } = useGettext()
  const hasShareJail = useCapabilityShareJailEnabled()
  const { getInternalSpace, getMatchingSpace } = useGetMatchingSpace()

  const getParentFolderName = (resource: Resource) => {
    if (isShareRoot(resource)) {
      return $gettext('Shared with me')
    }

    const parentFolder = extractParentFolderName(resource)
    if (parentFolder) {
      return parentFolder
    }

    if (!unref(hasShareJail)) {
      return $gettext('All files and folders')
    }

    if (isProjectSpaceResource(resource)) {
      return $gettext('Spaces')
    }

    const matchingSpace = unref(getMatchingSpace(resource))
    if (isProjectSpaceResource(matchingSpace) || isShareSpaceResource(matchingSpace)) {
      return matchingSpace.name
    }

    return $gettext('Personal')
  }

  const getParentFolderLinkIconAdditionalAttributes = (resource: Resource) => {
    // Identify if resource is project space or is part of a project space and the resource is located in its root
    if (
      isProjectSpaceResource(resource) ||
      (isProjectSpaceResource(getInternalSpace(resource.storageId) || ({} as Resource)) &&
        resource.path.split('/').length === 2)
    ) {
      return {
        name: 'layout-grid',
        'fill-type': 'fill'
      }
    }

    return {}
  }

  return {
    getParentFolderName,
    getParentFolderLinkIconAdditionalAttributes
  }
}
