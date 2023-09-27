import { AppNavigationItem } from '@ownclouders/web-pkg'

export interface NavItem extends Omit<AppNavigationItem, 'name'> {
  name: string
  active: boolean
}
