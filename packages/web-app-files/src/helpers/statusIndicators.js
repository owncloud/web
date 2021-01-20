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

const isIndirectUserShare = resource => {
  return (
    resource.isReceivedShare() ||
    intersection(userShareTypes, shareTypesIndirect(resource.path)).length > 0
  )
}

const isDirectLinkShare = resource => {
  return $shareTypes(resource).indexOf(shareTypes.link) >= 0
}

const isIndirectLinkShare = resource => {
  return shareTypesIndirect(resource.path).indexOf(shareTypes.link) >= 0
}

const isUserShare = resource => {
  return isDirectUserShare(resource) || isIndirectUserShare(resource)
}

const isLinkShare = resource => {
  return isDirectLinkShare(resource) || isIndirectLinkShare(resource)
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

const shareTypesIndirect = path => {
  const parentPath = getParentPaths(path)

  if (parentPath.length === 0) {
    return []
  }

  // remove root entry
  parentPath.pop()

  const shareTypes = {}

  parentPath.forEach(parentPath => {
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

export const getIndicators = resource => {
  const indicators = [
    {
      id: 'files-sharing',
      label: shareUserIconLabel(resource),
      visible: isUserShare(resource),
      icon: 'group',
      handler: () => {}
    },
    {
      id: 'file-link',
      label: shareLinkIconLabel(resource),
      visible: isLinkShare(resource),
      icon: 'link',
      handler: () => {}
    }
  ]

  return indicators.filter(indicator => indicator.visible)
}
