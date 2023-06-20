import { Action } from '../composables/actions'
import { defineStore } from 'pinia'

export interface Extension {
  id: string
  type: string
}

export interface ActionExtension extends Extension {
  type: 'action'
  action: Action
}

export const useExtensionRegistry = defineStore('extensionRegistry', {
  state: () => ({ extensions: {} as Record<string, Extension[]> }),
  actions: {
    registerExtension(extension: Extension) {
      this.extensions[extension.type] = this.extensions[extension.type] || []
      this.extensions[extension.type].push(extension)
    },
    registerExtensions(extensions: Extension[]) {
      extensions.forEach((e) => this.registerExtension(e))
    }
  },
  getters: {
    requestExtensions:
      (state) =>
      <ExtensionType extends Extension>(type: string) =>
        (state.extensions[type] || []) as ExtensionType[]
  }
})
