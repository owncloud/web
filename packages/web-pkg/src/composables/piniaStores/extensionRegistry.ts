import { Action } from '../actions'
import { SearchProvider, SideBarPanel } from '../../components'
import { defineStore } from 'pinia'
import { Ref, unref } from 'vue'
import { AppNavigationItem } from '../../apps'
import { Item } from '@ownclouders/web-client/src/helpers'
import { useConfigStore } from './config'

export type ExtensionScope = 'resource' | 'user' | 'group' | string

export type BaseExtension = {
  id: string
  type: string
  scopes?: ExtensionScope[]
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

export type Extension =
  | ActionExtension
  | SearchExtension
  | SidebarNavExtension
  | SidebarPanelExtension<Item, Item, Item>

export const useExtensionRegistry = () => {
  const configStore = useConfigStore()

  return defineStore('extensionRegistry', {
    state: () => ({ extensions: [] as Ref<Extension[]>[] }),
    actions: {
      registerExtensions(extensions: Ref<Extension[]>) {
        this.extensions.push(extensions)
      }
    },
    getters: {
      requestExtensions:
        (state) =>
        <ExtensionType extends Extension>(type: string, scopes?: string[]) => {
          return state.extensions
            .map((e) =>
              unref(e).filter(
                (e) =>
                  e.type === type &&
                  !configStore.options.disabledExtensions.includes(e.id) &&
                  (!scopes || e.scopes?.some((s) => scopes.includes(s)))
              )
            )
            .flat() as ExtensionType[]
        }
    }
  })()
}

export type ExtensionRegistry = ReturnType<typeof useExtensionRegistry>
