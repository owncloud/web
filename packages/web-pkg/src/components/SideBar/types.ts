import { defineComponent } from 'vue'
import { IconFillType } from 'design-system/src/helpers'
import { Item } from '@ownclouders/web-client/src/helpers'

export interface SideBarPanelContext<P, T extends Item> {
  parent?: P
  items?: T[]
}

export interface SideBarPanel<P, T extends Item> {
  name: string
  icon: string
  iconFillType?: IconFillType
  title(context: SideBarPanelContext<P, T>): string
  isVisible(context: SideBarPanelContext<P, T>): boolean
  component: ReturnType<typeof defineComponent>
  componentAttrs?(context: SideBarPanelContext<P, T>): any
  /**
   * param for sorting the panels.
   * In the long run this should be configured by admins or even users, as it's ideally not to be decided by extension developer.
   */
  priority?: number
  /**
   * defines if the panel is a `root` level panel in the right sidebar.
   * In the long run this should be configured by admins or even users, as it's ideally not to be decided by extension developer.
   */
  isRoot?(context: SideBarPanelContext<P, T>): boolean
}
