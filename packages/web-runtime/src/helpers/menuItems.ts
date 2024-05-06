import { ApplicationMenuItem } from '@ownclouders/web-pkg'

export interface MenuItem extends ApplicationMenuItem {
  id: string
  icon: string
  iconUrl: string
  title: string
  color: string
  defaultExtension: string
  active?: boolean
  path?: string
  target?: string
  url?: string
}
