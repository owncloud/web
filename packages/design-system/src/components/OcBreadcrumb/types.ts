import { RouteLocationRaw } from 'vue-router'

export interface BreadcrumbItem {
  id?: string
  text: string
  to?: RouteLocationRaw
  allowContextActions?: boolean
  onClick?: () => void
  isPreviousHiddenFolder?: boolean
}
