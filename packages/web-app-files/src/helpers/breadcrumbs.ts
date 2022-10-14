import { eventBus } from 'web-pkg/src/services/eventBus'
import { Location } from 'vue-router'
import omit from 'lodash-es/omit'

export interface BreadcrumbItem {
  text: string
  to?: Location
  allowContextActions?: boolean
  onClick?: () => void
}

export const breadcrumbsFromPath = (
  currentRoute: Location,
  resourcePath: string
): BreadcrumbItem[] => {
  const pathSplit = (p = '') => p.split('/').filter(Boolean)
  const current = pathSplit(currentRoute.path)
  const resource = pathSplit(resourcePath)

  return resource.map(
    (text, i) =>
      ({
        allowContextActions: true,
        text,
        to: {
          path: '/' + [...current].splice(0, current.length - resource.length + i + 1).join('/'),
          query: omit(currentRoute.query, 'fileId') // TODO: we need the correct fileId in the query. until we have that we must omit it because otherwise we would correct the path to the one of the (wrong) fileId.
        }
      } as BreadcrumbItem)
  )
}

export const concatBreadcrumbs = (...items: BreadcrumbItem[]): BreadcrumbItem[] => {
  const last = items.pop()

  return [
    ...items,
    {
      allowContextActions: last.allowContextActions,
      text: last.text,
      onClick: () => eventBus.publish('app.files.list.load')
    }
  ]
}
