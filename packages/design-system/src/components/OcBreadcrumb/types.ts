import { RouteLocationRaw } from 'vue-router'

export interface BreadcrumbItem {
  text: string
  to?: RouteLocationRaw
  allowContextActions?: boolean
  onClick?: () => void
  isPreviousHiddenFolder?: boolean
}
