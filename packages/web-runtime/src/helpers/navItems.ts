import { AppNavigationItem } from 'web-pkg/src/apps'

export interface NavItem extends Omit<AppNavigationItem, 'name'> {
  name: string
  active: boolean
}
