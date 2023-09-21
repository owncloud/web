import { eventBus } from 'web-pkg/src/services/eventBus'
import { RouteLocation } from 'vue-router'
import omit from 'lodash-es/omit'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { v4 as uuidv4 } from 'uuid'
import { SpaceResource } from 'web-client/src'
import { isMountPointSpaceResource } from 'web-client/src/helpers'
import { urlJoin } from 'web-client/src/utils'

export const breadcrumbsFromPath = (
  currentRoute: RouteLocation,
  space: SpaceResource,
  resourcePath: string,
  spaces: SpaceResource[],
  fullyAccessibleSpace: boolean,
  fullShareOwnerPaths: boolean
): BreadcrumbItem[] => {
  const pathSplit = (p = '') => p.split('/').filter(Boolean)
  const current = pathSplit(currentRoute.path)
  const resource = pathSplit(resourcePath)

  const getMountPoints = () =>
    spaces.filter((s) => isMountPointSpaceResource(s) && s.root.remoteItem.rootId === space.id)

  return resource.map((text, i) => {
    const isAccessible =
      fullyAccessibleSpace ||
      !fullShareOwnerPaths ||
      getMountPoints().some((m) =>
        urlJoin(...resource.slice(0, i + 1), { leadingSlash: true }).startsWith(
          m.root.remoteItem.path
        )
      )

    return {
      id: uuidv4(),
      allowContextActions: true,
      text,
      ...(isAccessible && {
        to: {
          path: '/' + [...current].splice(0, current.length - resource.length + i + 1).join('/'),
          query: omit(currentRoute.query, 'fileId', 'page') // TODO: we need the correct fileId in the query. until we have that we must omit it because otherwise we would correct the path to the one of the (wrong) fileId.
        }
      }),
      isStaticNav: false
    } as BreadcrumbItem
  })
}

export const concatBreadcrumbs = (...items: BreadcrumbItem[]): BreadcrumbItem[] => {
  const last = items.pop()

  return [
    ...items,
    {
      id: uuidv4(),
      allowContextActions: last.allowContextActions,
      text: last.text,
      onClick: () => eventBus.publish('app.files.list.load'),
      isTruncationPlaceholder: last.isTruncationPlaceholder,
      isStaticNav: last.isStaticNav
    }
  ]
}
