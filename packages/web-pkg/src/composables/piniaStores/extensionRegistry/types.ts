import { Action } from '../../actions'
import { SearchProvider, SideBarPanel } from '../../../components'
import { AppNavigationItem } from '../../../apps'
import { Item } from '@ownclouders/web-client/src/helpers'
import { FolderView } from '../../../ui'
import { Slot } from 'vue'
import { StringUnionOrAnyString } from '../../../utils'

export type ExtensionType = StringUnionOrAnyString<
  'action' | 'search' | 'sidebarNav' | 'sidebarPanel' | 'folderView' | 'customComponent'
>

export type ExtensionScope = StringUnionOrAnyString<'resource' | 'user' | 'group'>

export type BaseExtension = {
  id: string
  type: ExtensionType
  extensionPointIds?: string[]
  scopes?: ExtensionScope[] // TODO: deprecated
  userPreference?: {
    optionLabel?: string
  }
}

export interface ActionExtension extends BaseExtension {
  type: 'action'
  action: Action
}

export interface SearchExtension extends BaseExtension {
  type: 'search'
  searchProvider: SearchProvider
}

export interface SidebarNavExtension extends BaseExtension {
  type: 'sidebarNav'
  navItem: AppNavigationItem
}

export interface SidebarPanelExtension<R extends Item, P extends Item, T extends Item>
  extends BaseExtension {
  type: 'sidebarPanel'
  panel: SideBarPanel<R, P, T>
}

export interface FolderViewExtension extends BaseExtension {
  type: 'folderView'
  folderView: FolderView
}

export interface CustomComponentExtension extends BaseExtension {
  type: 'customComponent'
  content: Slot
}

export type Extension =
  | ActionExtension
  | SearchExtension
  | SidebarNavExtension
  | SidebarPanelExtension<Item, Item, Item>
  | FolderViewExtension
  | CustomComponentExtension

export type ExtensionPoint = {
  id: string
  type: ExtensionType
  multiple?: boolean
  defaultExtensionId?: string
  userPreference?: {
    label: string
  }
}
