import { eventBus } from 'web-pkg/src/services/eventBus'
import { RouteLocation } from 'vue-router'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { v4 as uuidv4 } from 'uuid'
import omit from 'lodash-es/omit'
import { AncestorMetaData } from 'web-pkg/src/types'
import { join } from 'path'

export const breadcrumbsFor = (
  currentRoute: RouteLocation,
  resourceId: string,
  resourcePath: string,
  ancestorMetaData: AncestorMetaData
): BreadcrumbItem[] => {
  // if the resource is no file id but a storageId we have no breadcrumbs
  if (resourceId && !resourceId.includes('!')) {
    return []
  }

  const pathSplit = (p = '') => p.split('/').filter(Boolean)
  const current = pathSplit(currentRoute.path)

  const breadcrumbs = [] as BreadcrumbItem[]
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

  const basePath =
    '/' + current.slice(0, -pathSplit(currentAncestorMetaDataValue.path).length).join('/')
  while (currentAncestorMetaDataValue && currentAncestorMetaDataValue.path !== '/') {
    const item: BreadcrumbItem = {
      id: uuidv4(),
      allowContextActions: true,
      text: currentAncestorMetaDataValue.name,
      to: {
        path: join(basePath, currentAncestorMetaDataValue.path),
        query: { ...omit(currentRoute.query, 'page'), fileId: currentAncestorMetaDataValue.id }
      },
      isStaticNav: false
    } as BreadcrumbItem
    breadcrumbs.unshift(item)
    currentAncestorMetaDataValue = ancestorMetaData[currentAncestorMetaDataValue.parentFolderId]
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
