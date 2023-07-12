import { Action } from '../actions'
import { defineStore } from 'pinia'
import { Ref, unref } from 'vue'

export type BaseExtension = {
  id: string
  type: string
}

export interface ActionExtension extends BaseExtension {
  type: 'action'
  action: Action
}

export type Extension = ActionExtension // | FooExtension | BarExtension

export const useExtensionRegistry = defineStore('extensionRegistry', {
  state: () => ({ extensions: [] as Ref<Extension[]>[] }),
  actions: {
    registerExtensions(extensions: Ref<Extension[]>) {
      this.extensions.push(extensions)
    }
  },
  getters: {
    requestExtensions:
      (state) =>
      <ExtensionType extends Extension>(type: string) => {
        return state.extensions.map((e) => unref(e).filter((e) => e.type === type)).flat()
      }
  }
})
