import { defineStore } from 'pinia'
import { Ref, unref } from 'vue'
import { useConfigStore } from '../config'
import { Extension, ExtensionPoint, ExtensionScope, ExtensionType } from './types'

export const useExtensionRegistry = () => {
  const configStore = useConfigStore()

  return defineStore('extensionRegistry', {
    state: () => ({
      extensions: [] as Ref<Extension[]>[],
      extensionPoints: [] as ExtensionPoint[]
    }),
    actions: {
      registerExtensions(extensions: Ref<Extension[]>) {
        this.extensions.push(extensions)
      },
      registerExtensionPoint(extensionPoint: ExtensionPoint) {
        this.extensionPoints.push(extensionPoint)
      }
    },
    getters: {
      requestExtensions:
        (state) =>
        <T extends Extension>(
          type: ExtensionType,
          options?: {
            scopes?: ExtensionScope[]
            extensionPointIds?: string[]
          }
        ) => {
          return state.extensions.flatMap((e) =>
            unref(e).filter(
              (e) =>
                e.type === type &&
                !configStore.options.disabledExtensions.includes(e.id) &&
                (!options?.scopes || e.scopes?.some((s) => options?.scopes.includes(s))) &&
                (!options?.extensionPointIds ||
                  e.extensionPointIds?.some((id) => options?.extensionPointIds.includes(id)))
            )
          ) as T[]
        },
      getExtensionPoints:
        (state) =>
        <T extends ExtensionPoint>(
          options: {
            type?: ExtensionType
          } = {}
        ) => {
          return state.extensionPoints.filter((e) => {
            if (Object.prototype.hasOwnProperty.call(options, 'type') && e.type !== options.type) {
              return false
            }
            return true
          }) as T[]
        }
    }
  })()
}

export type ExtensionRegistry = ReturnType<typeof useExtensionRegistry>
