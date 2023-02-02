import { ShareTypes } from 'web-client/src/helpers/share'
import { ClientService, eventBus, useClientService } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { getParentPaths } from 'web-app-files/src/helpers/path'
import { DavProperty } from 'web-client/src/webdav/constants'
import { SpaceResource } from 'web-client'

// dummy to trick gettext string extraction into recognizing strings
const $gettext = (str) => {
  return str
}

const isDirectUserShare = (resource) => {
  return ShareTypes.containsAnyValue(ShareTypes.authenticated, resource.shareTypes ?? [])
}

const isDirectLinkShare = (resource) => {
  return ShareTypes.containsAnyValue(ShareTypes.unauthenticated, resource.shareTypes ?? [])
}

const shareUserIconDescribedBy = (resource) => {
  return isDirectUserShare(resource)
    ? $gettext('This item is directly shared with others.')
    : $gettext('This item is shared with others through one of the parent folders.')
}

const shareLinkDescribedBy = (resource) => {
  return isDirectLinkShare(resource)
    ? $gettext('This item is directly shared via links.')
    : $gettext('This item is shared via links through one of the parent folders.')
}

export const getUserIndicator = ({ resource }) => {
  return {
    id: `files-sharing-${resource.getDomSelector()}`,
    accessibleDescription: shareUserIconDescribedBy(resource),
    label: $gettext('Show invited people'),
    icon: 'group',
    target: 'sharing',
    type: isDirectUserShare(resource) ? 'user-direct' : 'user-indirect',
    handler: (resource, panel) => {
      eventBus.publish(SideBarEventTopics.openWithPanel, `${panel}#peopleShares`)
    }
  }
}

export const getLinkIndicator = ({ resource }) => {
  return {
    id: `file-link-${resource.getDomSelector()}`,
    accessibleDescription: shareLinkDescribedBy(resource),
    label: $gettext('Show links'),
    icon: 'link',
    target: 'sharing',
    type: isDirectLinkShare(resource) ? 'link-direct' : 'link-indirect',
    handler: (resource, panel) => {
      eventBus.publish(SideBarEventTopics.openWithPanel, `${panel}#linkShares`)
    }
  }
}

interface IndicatorsOptions {
  clientService?: ClientService
  space: SpaceResource
}

export function useIndicators(options: IndicatorsOptions) {
  const clientService = options.clientService || useClientService()
  const { webdav } = clientService
  const { space } = options

  // FIXME: separate composable? save in store?
  const getParentFolders = async ({ path }) => {
    const parentFolders = []
    const promises = []
    const parentPaths = getParentPaths(path, true)
    for (const path of parentPaths) {
      promises.push(
        webdav
          .listFiles(
            space,
            { path },
            { depth: 0, davProperties: [DavProperty.FileId, DavProperty.ShareTypes] }
          )
          .then(({ resource }) => parentFolders.push(resource))
      )
    }
    await Promise.all(promises)
    return parentFolders
  }

  const getIndicators = ({ resource, parentFolders = [] }) => {
    const indicators = []
    let isIndirectUserShare = false
    let isIndirectLinkShare = false

    for (const folder of parentFolders) {
      isIndirectUserShare = isIndirectUserShare ? true : isDirectUserShare(folder)
      isIndirectLinkShare = isIndirectLinkShare ? true : isDirectLinkShare(folder)
      if (isIndirectUserShare && isIndirectLinkShare) {
        break
      }
    }

    if (isDirectUserShare(resource) || isIndirectUserShare) {
      indicators.push(getUserIndicator({ resource }))
    }
    if (isDirectLinkShare(resource) || isIndirectLinkShare) {
      indicators.push(getLinkIndicator({ resource }))
    }

    return indicators
  }
  return { getIndicators, getParentFolders }
}
