import { eventBus } from '../../services/eventBus'
import { RouteLocation } from 'vue-router'
import omit from 'lodash-es/omit'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { v4 as uuidv4 } from 'uuid'
import { SpaceResource } from '@ownclouders/web-client'
import { urlJoin } from '@ownclouders/web-client'
import { useGetMatchingSpace } from '../spaces'
import { Ref, unref } from 'vue'
import { AncestorMetaData, AncestorMetaDataValue } from '../../types'

export const useBreadcrumbsFromPath = () => {
  const { isResourceAccessible } = useGetMatchingSpace()

  const breadcrumbsFromPath = ({
    route,
    space,
    resourcePath,
    ancestorMetaData
  }: {
    route: RouteLocation
    space: Ref<SpaceResource>
    resourcePath: string
    ancestorMetaData: Ref<AncestorMetaData>
  }): BreadcrumbItem[] => {
    const pathSplit = (p = '') => p.split('/').filter(Boolean)
    const current = pathSplit(route.path)
    const resource = pathSplit(resourcePath)

    return resource.map((text, i) => {
      const isAccessible = isResourceAccessible({
        space: unref(space),
        path: urlJoin(...resource.slice(0, i + 1), { leadingSlash: true })
      })

      let ancestor: AncestorMetaDataValue
      if (isAccessible) {
        // use ancestor to retrieve fileId
        const path = urlJoin(...resource.slice(0, i + 1), { leadingSlash: true })
        ancestor = unref(ancestorMetaData)[path]
      }

      return {
        id: uuidv4(),
        allowContextActions: true,
        text,
        ...(isAccessible && {
          to: {
            path: '/' + [...current].splice(0, current.length - resource.length + i + 1).join('/'),
            query: {
              ...omit(route.query, 'page'),
              ...(ancestor && { fileId: ancestor.id })
            }
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
