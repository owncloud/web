import { eventBus } from 'web-pkg/src/services/eventBus'
import { RouteLocation } from 'vue-router'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { v4 as uuidv4 } from 'uuid'
import omit from 'lodash-es/omit'
import { AncestorMetaData } from 'web-pkg/src/types'
import { dirname, join } from 'path'

export const breadcrumbsFor = ({
  currentRoute,
  resourceId,
  resourcePath,
  ancestorMetaData,
  fullShareOwnerPaths
}: {
  currentRoute: RouteLocation
  resourceId: string
  resourcePath: string
  ancestorMetaData: AncestorMetaData
  fullShareOwnerPaths: boolean
}): BreadcrumbItem[] => {
  // if the resource is no file id but a storageId we have no breadcrumbs
  if (resourceId && !resourceId.includes('!')) {
    return []
  }

  const pathSplit = (p = '') => p.split('/').filter(Boolean)
  const current = pathSplit(currentRoute.path)

  let breadcrumbs = [] as BreadcrumbItem[]
  let currentAncestorMetaDataValue
  if (resourceId) {
    currentAncestorMetaDataValue = ancestorMetaData[resourceId]
  } else {
    currentAncestorMetaDataValue = Object.values(ancestorMetaData).find((v) => {
      return v.path === resourcePath
    })
  }

  // FIXME: triggers flickering ...
  if (!currentAncestorMetaDataValue) {
    return []
  }

  let accessiblePath = []
  const basePath =
    '/' + current.slice(0, -pathSplit(currentAncestorMetaDataValue.path).length).join('/')
  while (currentAncestorMetaDataValue && currentAncestorMetaDataValue.path !== '/') {
    const item: BreadcrumbItem = {
      id: uuidv4(),
      allowContextActions: true,
      text: currentAncestorMetaDataValue.name,
      to: {
        path: join(basePath, currentAncestorMetaDataValue.path),
        query: {
          ...omit(currentRoute.query, 'page'),
          // FIXME: add only when idBased routing is on
          ...(true && { fileId: currentAncestorMetaDataValue.id })
        }
      },
      isStaticNav: false
    } as BreadcrumbItem
    breadcrumbs.unshift(item)
    accessiblePath.unshift(currentAncestorMetaDataValue.name)
    currentAncestorMetaDataValue = ancestorMetaData[currentAncestorMetaDataValue.parentFolderId]
  }

  if (fullShareOwnerPaths) {
    const inaccessiblePath = resourcePath.slice(0, -accessiblePath.join('/').length)
    const inaccessibleBreadcrumbs = inaccessiblePath
      .split('/')
      .filter(Boolean)
      .map((name): BreadcrumbItem => {
        return {
          id: uuidv4(),
          text: name,
          isStaticNav: false
        }
      })

    breadcrumbs = [...inaccessibleBreadcrumbs, ...breadcrumbs]
  }

  return breadcrumbs
}

export const concatBreadcrumbs = (...items: BreadcrumbItem[]): BreadcrumbItem[] => {
  const last = items.pop()

  return [
    ...items.filter(Boolean),
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
