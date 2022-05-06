import { bus } from 'web-pkg/src/instance'
import { Location } from 'vue-router'

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
          query: currentRoute.query
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
      onClick: () => bus.publish('app.files.list.load')
    }
  ]
}
