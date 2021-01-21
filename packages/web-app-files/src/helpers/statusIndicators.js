import intersection from 'lodash/intersection'
import { shareTypes, userShareTypes } from './shareTypes'
import { getParentPaths } from './path'
import { $gettext } from '../gettext'

const $shareTypes = resource => {
  if (typeof resource.shareTypes !== 'undefined') {
    return resource.shareTypes
  }

  if (resource.shares) {
    return Array.from(new Set(resource.shares.map(share => parseInt(share.type, 10))))
  }

  return []
}

const isDirectUserShare = resource => {
  return intersection(userShareTypes, $shareTypes(resource)).length > 0
}

const isIndirectUserShare = (resource, sharesTree) => {
  console.log(shareTypesIndirect(resource.path, sharesTree))
  return (
    resource.isReceivedShare() ||
    intersection(userShareTypes, shareTypesIndirect(resource.path, sharesTree)).length > 0
  )
}

const isDirectLinkShare = resource => {
  return $shareTypes(resource).indexOf(shareTypes.link) >= 0
}

const isIndirectLinkShare = (resource, sharesTree) => {
  return shareTypesIndirect(resource.path, sharesTree).indexOf(shareTypes.link) >= 0
}

const isUserShare = (resource, sharesTree) => {
  return isDirectUserShare(resource) || isIndirectUserShare(resource, sharesTree)
}

const isLinkShare = (resource, sharesTree) => {
  return isDirectLinkShare(resource) || isIndirectLinkShare(resource, sharesTree)
}

const shareUserIconLabel = resource => {
  return isDirectUserShare(resource)
    ? $gettext('Directly shared with people')
    : $gettext('Shared with people through one of the parent folders')
}

const shareLinkIconLabel = resource => {
  return isDirectLinkShare(resource)
    ? $gettext('Directly shared with links')
    : $gettext('Shared with links through one of the parent folders')
}

const shareTypesIndirect = (path, sharesTree) => {
  const parentPaths = getParentPaths(path, true)

  if (parentPaths.length === 0) {
    return []
  }

  // remove root entry
  parentPaths.pop()

  const shareTypes = {}

  parentPaths.forEach(parentPath => {
    // TODO: optimize for performance by skipping once we got all known types
    const shares = sharesTree[parentPath]

    if (shares) {
      shares.forEach(share => {
        // note: no distinction between incoming and outgoing shares as we display the same
        // indirect indicator for them
        shareTypes[share.shareType] = true
      })
    }
  })

  return Object.keys(shareTypes).map(shareType => parseInt(shareType, 10))
}

// TODO: Think of a different way how to access sharesTree
export const getIndicators = (resource, sharesTree) => {
  const indicators = [
    {
      id: 'files-sharing',
      label: shareUserIconLabel(resource, sharesTree),
      visible: isUserShare(resource, sharesTree),
      icon: 'group',
      handler: () => {}
    },
    {
      id: 'file-link',
      label: shareLinkIconLabel(resource, sharesTree),
      visible: isLinkShare(resource, sharesTree),
      icon: 'link',
      handler: () => {}
    }
  ]

  return indicators.filter(indicator => indicator.visible)
}
