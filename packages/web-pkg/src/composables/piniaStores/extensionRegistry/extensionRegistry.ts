import { defineStore } from 'pinia'
import { ref, Ref, unref } from 'vue'
import { useConfigStore } from '../config'
import { Extension, ExtensionPoint, ExtensionScope, ExtensionType } from './types'

export const useExtensionRegistry = defineStore('extensionRegistry', () => {
  const configStore = useConfigStore()

  const extensions = ref<Ref<Extension[]>[]>([])

  const registerExtensions = (e: Ref<Extension[]>) => {
    extensions.value.push(e)
  }
  const requestExtensions = <T extends Extension>(
    type: ExtensionType,
    options?: {
      scopes?: ExtensionScope[]
      extensionPointIds?: string[]
    }
  ) => {
    return unref(extensions).flatMap((e) =>
      unref(e).filter(
        (e) =>
          e.type === type &&
          !configStore.options.disabledExtensions.includes(e.id) &&
          (!options?.scopes || e.scopes?.some((s) => options?.scopes.includes(s))) &&
          (!options?.extensionPointIds ||
            e.extensionPointIds?.some((id) => options?.extensionPointIds.includes(id)))
      )
    ) as T[]
  }

  const extensionPoints = ref<Ref<ExtensionPoint[]>[]>([])
  const registerExtensionPoint = (e: ExtensionPoint) => {
    extensionPoints.value.push(ref([e]))
  }
  const registerExtensionPoints = (e: Ref<ExtensionPoint[]>) => {
    extensionPoints.value.push(e)
  }
  const getExtensionPoints = <T extends ExtensionPoint>(
    options: {
      type?: ExtensionType
    } = {}
  ) => {
    return unref(extensionPoints).flatMap(
      (e) =>
        unref(e).filter((e) => {
          if (Object.hasOwn(options, 'type') && e.type !== options.type) {
            return false
          }
          return true
        }) as T[]
    )
  }

  return {
    extensions,
    registerExtensions,
    requestExtensions,
    extensionPoints,
    registerExtensionPoint,
    registerExtensionPoints,
    getExtensionPoints
  }
})

export type ExtensionRegistry = ReturnType<typeof useExtensionRegistry>
