import { bus } from 'web-pkg/src/instance'

export interface BreadcrumbItem {
  text: string
  to?: string
  allowContextActions?: boolean
  onClick?: () => void
}

export const breadcrumbsFromPath = (
  currentPath: string,
  resourcePath: string
): BreadcrumbItem[] => {
  const pathSplit = (p = '') => p.split('/').filter(Boolean)
  const current = pathSplit(currentPath)
  const resource = pathSplit(resourcePath)

  return resource.map(
    (text, i) =>
      ({
        allowContextActions: true,
        text,
        to: '/' + [...current].splice(0, current.length - resource.length + i + 1).join('/')
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
