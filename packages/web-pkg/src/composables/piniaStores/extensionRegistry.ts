import { Action } from '../actions'
import { SearchProvider } from '../../components/Search'
import { defineStore } from 'pinia'
import { Ref, hasInjectionContext, unref } from 'vue'
import { useConfigurationManager } from '../configuration'
import { ConfigurationManager } from '../../configuration'
import { AppNavigationItem } from '../../apps'

export type BaseExtension = {
  id: string
  type: string
  scopes?: string[]
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

export type Extension = ActionExtension | SearchExtension | SidebarNavExtension

export const useExtensionRegistry = ({
  configurationManager
}: { configurationManager?: ConfigurationManager } = {}) => {
  if (!hasInjectionContext() && !configurationManager) {
    throw new Error('no injection context, you need to pass configuration manager via options')
  }

  const { options } = configurationManager || useConfigurationManager()

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
        <ExtensionType extends Extension>(type: string, scope?: string) => {
          return state.extensions
            .map((e) =>
              unref(e).filter(
                (e) =>
                  e.type === type &&
                  !options.disabledExtensions.includes(e.id) &&
                  (!scope || e.scopes?.includes(scope))
              )
            )
            .flat() as ExtensionType[]
        }
    }
  })()
}

export type ExtensionRegistry = ReturnType<typeof useExtensionRegistry>
