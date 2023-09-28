import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import { eventBus } from '../services'
import { SideBarEventTopics } from '../composables/sideBar'
import { createLocationShares } from '../router'
import { Resource } from '@ownclouders/web-client'
import { AncestorMetaData } from '../types'

// dummy to trick gettext string extraction into recognizing strings
const $gettext = (str) => {
  return str
}

const isUserShare = (shareTypes) => {
  return ShareTypes.containsAnyValue(ShareTypes.authenticated, shareTypes ?? [])
}

const isLinkShare = (shareTypes) => {
  return ShareTypes.containsAnyValue(ShareTypes.unauthenticated, shareTypes ?? [])
}

const shareUserIconDescribedBy = ({ isDirect }) => {
  return isDirect
    ? $gettext('This item is directly shared with others.')
    : $gettext('This item is shared with others through one of the parent folders.')
}

const shareLinkDescribedBy = ({ isDirect }) => {
  return isDirect
    ? $gettext('This item is directly shared via links.')
    : $gettext('This item is shared via links through one of the parent folders.')
}

const getUserIndicator = ({ resource, isDirect, isIncoming = false }) => {
  return {
    id: `files-sharing-${resource.getDomSelector()}`,
    accessibleDescription: shareUserIconDescribedBy({ isDirect }),
    label: isIncoming ? $gettext('Shared with you') : $gettext('Show invited people'),
    icon: 'group',
    target: 'sharing',
    type: isDirect ? 'user-direct' : 'user-indirect',
    handler: (resource, panel, $router) => {
      if (isIncoming) {
        $router.push(createLocationShares('files-shares-with-me'))
        return
      }
      eventBus.publish(SideBarEventTopics.openWithPanel, `${panel}#peopleShares`)
    }
  }
}

const getLinkIndicator = ({ resource, isDirect }) => {
  return {
    id: `file-link-${resource.getDomSelector()}`,
    accessibleDescription: shareLinkDescribedBy({ isDirect }),
    label: $gettext('Show links'),
    icon: 'link',
    target: 'sharing',
    type: isDirect ? 'link-direct' : 'link-indirect',
    handler: (resource, panel) => {
      eventBus.publish(SideBarEventTopics.openWithPanel, `${panel}#linkShares`)
    }
  }
}

export const getIndicators = ({
  resource,
  ancestorMetaData
}: {
  resource: Resource
  ancestorMetaData: AncestorMetaData
}) => {
  const indicators = []
  const parentShareTypes = Object.values(ancestorMetaData).reduce((acc: any, data: any) => {
    acc.push(...(data.shareTypes || []))
    return acc
  }, [])
  const isDirectUserShare = isUserShare(resource.shareTypes)
  if (isDirectUserShare || isUserShare(parentShareTypes)) {
    indicators.push(getUserIndicator({ resource, isDirect: isDirectUserShare }))
  } else if (resource.isReceivedShare()) {
    indicators.push(getUserIndicator({ resource, isDirect: false, isIncoming: true }))
  }
  const isDirectLinkShare = isLinkShare(resource.shareTypes)
  if (isDirectLinkShare || isLinkShare(parentShareTypes)) {
    indicators.push(getLinkIndicator({ resource, isDirect: isDirectLinkShare }))
  }
  return indicators
}
