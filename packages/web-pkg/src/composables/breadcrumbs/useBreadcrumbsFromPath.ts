import { eventBus } from 'web-pkg/src/services/eventBus'
import { RouteLocation } from 'vue-router'
import omit from 'lodash-es/omit'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { v4 as uuidv4 } from 'uuid'
import { SpaceResource } from 'web-client/src'
import { urlJoin } from 'web-client/src/utils'
import { useGetMatchingSpace } from '../spaces'

export const useBreadcrumbsFromPath = () => {
  const breadcrumbsFromPath = ({
    route,
    space,
    resourcePath
  }: {
    route: RouteLocation
    space: SpaceResource
    resourcePath: string
  }): BreadcrumbItem[] => {
    const { isResourceAccessible } = useGetMatchingSpace()

    const pathSplit = (p = '') => p.split('/').filter(Boolean)
    const current = pathSplit(route.path)
    const resource = pathSplit(resourcePath)

    return resource.map((text, i) => {
      const isAccessible = isResourceAccessible({
        space,
        path: urlJoin(...resource.slice(0, i + 1), { leadingSlash: true })
      })

      return {
        id: uuidv4(),
        allowContextActions: true,
        text,
        ...(isAccessible && {
          to: {
            path: '/' + [...current].splice(0, current.length - resource.length + i + 1).join('/'),
            query: omit(route.query, 'fileId', 'page') // TODO: we need the correct fileId in the query. until we have that we must omit it because otherwise we would correct the path to the one of the (wrong) fileId.
          }
        }),
        isStaticNav: false
      } as BreadcrumbItem
    })
  }

  const concatBreadcrumbs = (...items: BreadcrumbItem[]): BreadcrumbItem[] => {
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
  return { breadcrumbsFromPath, concatBreadcrumbs }
}
